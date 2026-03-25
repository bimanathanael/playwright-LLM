/**
 * LLM-driven Playwright API test generator (Gemini).
 *
 * Requirements covered:
 * - Uses `GEMINI_API_KEY` from environment (no hardcoding).
 * - Reads Swagger/OpenAPI v2 JSON from disk.
 * - Extracts at least 1 endpoint (deterministically).
 * - Calls Gemini and writes ONLY the returned TypeScript test code to:
 *   generated_test/api/generated-api.spec.ts
 * - Idempotent: overwrites the output file on each run.
 *
 * Usage:
 *   node scripts/generate-api-test.js --swagger "D:\\application_code\\docs\\swagger.json"
 *   # or:
 *   SWAGGER_PATH="D:\\application_code\\docs\\swagger.json" node scripts/generate-api-test.js
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_SWAGGER_PATHS = [
  // When running from `playwright-LLM/`
  path.join(process.cwd(), '..', 'application_code', 'docs', 'swagger.json'),
  path.join(process.cwd(), 'application_code', 'docs', 'swagger.json'),
];

const DEFAULT_OUTPUT_PATH = path.join(
  process.cwd(),
  'generated_test',
  'api',
  'generated-api.spec.ts'
);

const GEMINI_GENERATE_ENDPOINT = (model, apiKey) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--swagger' && argv[i + 1]) {
      args.swagger = argv[i + 1];
      i++;
    }
  }
  return args;
}

function stripCodeFences(text) {
  // Remove common markdown fences that models may output.
  let out = text.trim();
  out = out.replace(/^```[a-zA-Z]*\s*/g, '');
  out = out.replace(/```$/g, '');
  return out.trim();
}

function extractOnlyPlaywrightTestCode(text) {
  // Even if Gemini includes preamble text, keep only the portion starting at the Playwright import.
  const s = stripCodeFences(text);
  const importRegex = /import\s*\{\s*test\s*,\s*expect\s*\}\s*from\s*['"]@playwright\/test['"]\s*;?\s*/m;
  const m = s.match(importRegex);
  if (!m?.[0]) return s;
  const startIdx = s.indexOf(m[0]);
  return s.slice(startIdx).trim();
}

function getRefTarget(swagger, ref) {
  // Swagger v2 refs are commonly: "#/definitions/ModelName"
  if (!ref || typeof ref !== 'string') return undefined;
  const parts = ref.replace(/^#\//, '').split('/');
  let cur = swagger;
  for (const p of parts) cur = cur?.[p];
  return cur;
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

function buildExampleFromSchema(schema, fallback = {}) {
  if (!schema || typeof schema !== 'object') return fallback;

  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;

  // Handle object schemas with properties.
  if (schema.type === 'object' && schema.properties && typeof schema.properties === 'object') {
    const obj = {};
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      obj[propName] = buildExampleFromSchema(propSchema, propSchema?.example ?? undefined);
    }
    return obj;
  }

  // Primitive guesses
  switch (schema.type) {
    case 'string':
      if (schema.format === 'email') return 'user@example.com';
      return 'test';
    case 'integer':
    case 'number':
      return 1;
    case 'boolean':
      return true;
    case 'array':
      return [];
    default:
      return fallback;
  }
}

function extractSingleDeterministicEndpoint(swagger) {
  if (!swagger?.paths || typeof swagger.paths !== 'object') {
    throw new Error('Invalid Swagger JSON: missing `paths` object');
  }

  const methodsPriority = ['get', 'post', 'put', 'patch', 'delete'];
  const pathKeys = Object.keys(swagger.paths).sort((a, b) => a.localeCompare(b));

  // Prefer a simple endpoint if present.
  const preferred = '/api/health';
  const candidatePaths = pathKeys.includes(preferred) ? [preferred, ...pathKeys.filter((p) => p !== preferred)] : pathKeys;

  for (const p of candidatePaths) {
    const pathItem = swagger.paths[p];
    for (const m of methodsPriority) {
      if (pathItem?.[m]) {
        const operation = pathItem[m];
        return { path: p, method: m.toUpperCase(), operation };
      }
    }
  }

  throw new Error('No endpoints found in Swagger JSON');
}

function deriveEndpointPayloadAndExpectations(swagger, endpoint) {
  const { method, path: opPath, operation } = endpoint;

  const parameters = Array.isArray(operation?.parameters) ? operation.parameters : [];
  const bodyParam = parameters.find((p) => p?.in === 'body') || null;

  let requestBodySchema = null;
  if (bodyParam?.schema) {
    if (bodyParam.schema.$ref) {
      requestBodySchema = getRefTarget(swagger, bodyParam.schema.$ref) || null;
    } else {
      requestBodySchema = bodyParam.schema;
    }
  }

  const requestPayload = method === 'GET' || !bodyParam
    ? null
    : buildExampleFromSchema(
        requestBodySchema,
        // fallback to property example if swagger provides it
        {}
      );

  const responses = operation?.responses && typeof operation.responses === 'object' ? operation.responses : {};
  const statusKeys = Object.keys(responses);

  // Pick the "best" success response deterministically.
  const twoHundreds = statusKeys
    .filter((k) => String(k).startsWith('2'))
    .sort((a, b) => Number(a) - Number(b));

  const expectedStatus = twoHundreds[0] ? Number(twoHundreds[0]) : Number(statusKeys.sort()[0] || 200);
  const expectedResponse = responses[String(expectedStatus)] || responses[twoHundreds[0]] || responses[statusKeys[0]] || {};

  // Response schema
  let responseSchema = null;
  const responseSchemaRef = expectedResponse?.schema?.$ref;
  if (responseSchemaRef) responseSchema = getRefTarget(swagger, responseSchemaRef) || null;
  else responseSchema = expectedResponse?.schema || null;

  // Extract top-level properties from response schema for assertions.
  const responseProperties = responseSchema?.properties && typeof responseSchema.properties === 'object'
    ? Object.entries(responseSchema.properties).map(([name, schema]) => {
        return {
          name,
          type: schema?.type || null,
          example: schema?.example ?? null,
          format: schema?.format ?? null,
        };
      })
    : [];

  return {
    opPath,
    method,
    requestPayload,
    expectedStatus,
    responseProperties,
    responseSchemaRef: responseSchemaRef || null,
  };
}

function buildPrompt({ swagger, endpoint, derived }) {
  const { method, path: opPath } = endpoint;
  const { requestPayload, expectedStatus, responseProperties } = derived;

  const endpointInfo = {
    method,
    path: opPath,
    host: swagger?.host || null,
    basePath: swagger?.basePath || null,
    expectedStatus,
  };

  const responseProps = responseProperties.length
    ? responseProperties
    : null;

  // Keep the prompt deterministic and explicit. Also ask for "code only" output.
  return `
You are an expert QA engineer and TypeScript author using Playwright for API testing.

Generate a single Playwright API test file in TypeScript that calls ONE Swagger-described endpoint.

CRITICAL OUTPUT RULES:
- Output ONLY valid TypeScript code for a Playwright test file.
- Do NOT include explanations, comments outside the code block, or markdown fences.

Test requirements:
1) Use: \`import { test, expect } from '@playwright/test';\`
2) Define: \`test.describe('LLM Generated API Test', () => { ... })\`
3) Inside, create exactly ONE test using: \`test('should ...', async ({ request }) => { ... })\`
4) Build the request URL as: \`const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:8080';\`
   then \`const url = apiBaseUrl + '${opPath}';\`
5) Call the endpoint using the Playwright \`request\` fixture:
   - GET: \`await request.get(url)\`
   - POST/PUT/PATCH: \`await request.${method.toLowerCase()}(url, { data: payload, headers: { 'Content-Type': 'application/json' } })\`
6) Assert:
   - \`expect(response.status()).toBe(${expectedStatus});\`
   - Parse JSON: \`const body = await response.json();\`
   - If responseProps are available: for each item, do \`expect(body).toHaveProperty('<name>')\`.
     If an example is provided, also assert equality for that property.
7) If there is a request body example/payload, include it as \`const payload = ...\` and send it.
   If no payload exists, do NOT send a body.

Swagger endpoint details (authoritative):
${JSON.stringify(endpointInfo, null, 2)}

Request body example (if applicable):
${requestPayload !== null ? JSON.stringify(requestPayload, null, 2) : 'null'}

Expected response properties (if available):
${responseProps !== null ? JSON.stringify(responseProps, null, 2) : 'null'}
`.trim();
}

async function callGemini({ apiKey, model, prompt }) {
  const res = await fetch(GEMINI_GENERATE_ENDPOINT(model, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0,
        topP: 1,
        // Keep output bounded so we don't get non-code trailing text.
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini request failed: HTTP ${res.status}. ${text}`.trim());
  }

  const json = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.[0]?.text ??
    json?.candidates?.[0]?.content?.parts?.map((p) => p?.text ?? '').join('') ??
    '';

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text;
}

function assertLooksLikeTestCode(code) {
  const s = code.trim();
  if (!/@playwright\/test['"]/.test(s)) {
    throw new Error('Generated code does not import Playwright test');
  }
  if (!/test\.describe\s*\(/.test(s) || !/test\(\s*['"`]/.test(s)) {
    throw new Error('Generated code does not look like a Playwright test file');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing required env var: GEMINI_API_KEY');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const swaggerPath =
    args.swagger ||
    process.env.SWAGGER_PATH ||
    DEFAULT_SWAGGER_PATHS.find((p) => fs.existsSync(p));

  if (!swaggerPath) {
    throw new Error(
      `Could not find Swagger JSON. Provide --swagger or set SWAGGER_PATH. Looked for: ${DEFAULT_SWAGGER_PATHS.join(', ')}`
    );
  }

  const swaggerRaw = await fs.promises.readFile(swaggerPath, 'utf8');
  const swagger = safeJsonParse(swaggerRaw);
  if (!swagger) throw new Error(`Invalid JSON in Swagger file: ${swaggerPath}`);

  const endpoint = extractSingleDeterministicEndpoint(swagger);
  const derived = deriveEndpointPayloadAndExpectations(swagger, endpoint);

  const prompt = buildPrompt({ swagger, endpoint, derived });
  const geminiRaw = await callGemini({ apiKey, model, prompt });

  const code = extractOnlyPlaywrightTestCode(geminiRaw);
  assertLooksLikeTestCode(code);

  const outPath = process.env.OUTPUT_PATH || DEFAULT_OUTPUT_PATH;
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  await fs.promises.writeFile(outPath, code, 'utf8');

  // Script logs are OK; only the generated test content must be code.
  console.log(`Generated Playwright API test written to: ${outPath}`);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});

