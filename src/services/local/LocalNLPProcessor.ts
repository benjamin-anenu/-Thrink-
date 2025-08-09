import { ACTION_WORDS, type ActionWord } from './ActionWords';
import { IntentClassifier, type Intent } from './IntentClassifier';
import { EntityExtractor, type Entity } from './EntityExtractor';

export interface ProcessedQuery {
  originalInput: string;
  actionWords: ActionWord[];
  intent: Intent;
  entities: Entity[];
}

export class LocalNLPProcessor {
  private classifier = new IntentClassifier();
  private extractor = new EntityExtractor();

  process(userInput: string): ProcessedQuery {
    const cleaned = userInput.trim();
    const actionWords = ACTION_WORDS.filter(aw =>
      aw.keywords.some(k => cleaned.toLowerCase().includes(k)) ||
      (aw.aliases || []).some(a => cleaned.toLowerCase().includes(a))
    );

    const intent = this.classifier.classify(cleaned, actionWords);
    const entities = this.extractor.extract(cleaned);

    return { originalInput: userInput, actionWords, intent, entities };
  }
}