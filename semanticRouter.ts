import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import yaml from 'js-yaml';

export interface RouteConfig {
  name: string;
  description: string;
  utterances: string[];
  llm: {
    model: string;
  };
  score_threshold: number;
}

export interface LoadedRoute extends RouteConfig {
  embeddings: number[][];
  modelInstance?: GenerativeModel;
}

export interface RouterConfig {
  encoder_name: string;
  encoder_type: string;
  routes: RouteConfig[];
}

export class SemanticRouter {
  private routes: LoadedRoute[] = [];
  private encoder: GenerativeModel | undefined;
  private defaultRoute: LoadedRoute | null = null;

  static async fromYaml(path: string): Promise<SemanticRouter> {
    const raw = fs.readFileSync(path, 'utf8');
    const data = yaml.load(raw) as RouterConfig;

    const router = new SemanticRouter();
    await router.initialize(data, process.env.API_KEY || '');
    return router;
  }

  private async initialize(config: RouterConfig, apiKey: string): Promise<void> {
    console.log(`Initializing semantic router with encoder: ${config.encoder_name}`);

    // Initialize the embedding model
    this.encoder = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: config.encoder_name,
    });

    // Build embeddings for each route
    for (const routeConfig of config.routes) {
      console.log(`Building embeddings for route: ${routeConfig.name}`);

      const route: LoadedRoute = {
        ...routeConfig,
        embeddings: [],
      };

      // Generate embeddings for all utterances
      for (const utterance of routeConfig.utterances) {
        const embedding = await this.embedText(utterance);
        route.embeddings.push(embedding);
      }

      route.modelInstance = new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: routeConfig.llm.model,
      });

      this.routes.push(route);

      if (!this.defaultRoute) {
        this.defaultRoute = route;
      }
    }

    console.log(`Router initialized with ${this.routes.length} routes`);
  }

  private async embedText(text: string): Promise<number[]> {
    if (!this.encoder) {
      throw new Error('Encoder not initialized');
    }

    const result = await this.encoder.embedContent({
      content: {
        parts: [{ text }],
        role: 'user',
      },
    });

    return result.embedding.values;
  }

  route(text: string) {
    return this.findBestRoute(text);
  }

  private async findBestRoute(text: string) {
    const queryEmbedding = await this.embedText(text);

    let bestRoute: LoadedRoute | null = null;
    let bestScore = -1;

    for (const route of this.routes) {
      for (const embedding of route.embeddings) {
        const score = this.cosineSimilarity(queryEmbedding, embedding);

        if (score > bestScore) {
          bestScore = score;
          bestRoute = route;
        }
      }
    }

    // Apply score threshold and fallback to default if needed
    if (bestRoute && bestScore < bestRoute.score_threshold) {
      console.log(`Score ${bestScore.toFixed(4)} below threshold ${bestRoute.score_threshold}, using default route`);
      bestRoute = this.defaultRoute;
      bestScore = 0;
    }

    const routeName = bestRoute?.name || 'none';
    console.log(`Selected route: ${routeName} (score: ${bestScore.toFixed(4)})`);

    return {
      route: bestRoute,
      score: bestScore,
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] ** 2;
      magnitudeB += b[i] ** 2;
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}
