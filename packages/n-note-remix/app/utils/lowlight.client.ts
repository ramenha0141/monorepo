import tsLanguageSyntax from 'highlight.js/lib/languages/typescript';
import { lowlight } from 'lowlight';

lowlight.registerLanguage('ts', tsLanguageSyntax);

export default lowlight;
