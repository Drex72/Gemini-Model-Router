import { LoadedRoute, SemanticRouter } from './semanticRouter';

interface ContentPart {
  text?: string;
  [key: string]: any;
}

const getTextForRouting = (parts: ContentPart[]): string => {
  const text = parts.find((part) => part.text)?.text ?? '';

  if (!text) {
    throw new Error('No text found in query for routing.');
  }

  return text;
};

interface ExecuteParams {
  route: LoadedRoute;
  contents: ContentPart[];
  config: any;
  text: string;
}

const executeLLMCall = async ({ route, contents, config, text }: ExecuteParams) => {
  if (!route.modelInstance) throw new Error(`Route ${route.name} is defined but has no configured LLM`);

  const genInput = {
    contents: [
      {
        role: 'user',
        parts: contents.length > 0 ? contents : [{ text }],
      },
    ],
  };

  // Non-streaming response
  const response = await route.modelInstance.generateContent({
    ...genInput,
    ...config,
  });

  const result = response.response.text();

  return result;
};

const main = async (router: SemanticRouter, contents: ContentPart[]) => {
  const textForRouting = getTextForRouting(contents);
  const routeResult = await router.route(textForRouting);

  const started = performance.now();

  const response = await executeLLMCall({
    config: {},
    contents,
    route: routeResult.route!,
    text: textForRouting,
  });

  const latency_ms = Math.round(performance.now() - started);

  console.log({ response, latency_ms });
};

const init = async () => {
  const router = await SemanticRouter.fromYaml('router.yaml');

  await main(router, [
    {
      text: 'Hello',
    },
  ]);

  await main(router, [
    {
      text: 'Explain the difference between nuclear fission and fusion in simple, easy-to-understand terms.',
    },
  ]);
};

init();
