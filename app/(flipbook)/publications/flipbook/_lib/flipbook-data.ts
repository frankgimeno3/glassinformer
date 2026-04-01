import type { FlipbookPage, Company } from "../_types/flipbook";
import { getLoremParagraphs } from "./lorem";

export function resolveParagraphsForPage(page: FlipbookPage): string[] {
  if (page.page_type === "cover") return [];
  if (page.articleContents?.length) {
    return page.articleContents
      .map((b) => b.text)
      .filter((t): t is string => Boolean(t?.trim()));
  }
  if (page.bodyParagraphs?.length) return page.bodyParagraphs;
  return getLoremParagraphs(page.page_id, 3);
}

export type FlipbookModel = {
  pages: FlipbookPage[];
  getViewSteps(): number[];
  getPageByNumber(pageNumber: number): FlipbookPage | undefined;
  getCompanyById(id: string): Company | undefined;
  getPageNumbersForStep(step: number): number[];
  getNextStep(current: number): number | null;
  getPrevStep(current: number): number | null;
  isValidStep(step: number): boolean;
  spreadStartIndex(pageOrStep: number): number;
  getSpreadLabel(step: number): string;
  parseSpreadParam(param: string): number | null;
  getArticleIndex(): { page_number: number; titulo: string }[];
};

export function createFlipbookModel(
  pages: FlipbookPage[],
  companies: Company[]
): FlipbookModel {
  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);

  function getViewSteps(): number[] {
    if (sorted.length === 0) return [];
    const steps: number[] = [0];
    for (let i = 1; i < sorted.length - 1; i += 2) {
      steps.push(sorted[i].page_number);
    }
    const lastNum = sorted[sorted.length - 1].page_number;
    if (lastNum !== 0 && !steps.includes(lastNum)) {
      steps.push(lastNum);
    }
    return steps;
  }

  function getPageByNumber(pageNumber: number): FlipbookPage | undefined {
    return sorted.find((p) => p.page_number === pageNumber);
  }

  function getCompanyById(id: string): Company | undefined {
    return companies.find((c) => c.company_id === id);
  }

  function getPageNumbersForStep(step: number): number[] {
    const lastNum = sorted[sorted.length - 1]?.page_number ?? 0;
    if (step === 0) return [0];
    if (step === lastNum) return [lastNum];
    const right = step + 1;
    const hasRight = sorted.some((p) => p.page_number === right);
    return hasRight ? [step, right] : [step];
  }

  function getNextStep(current: number): number | null {
    const steps = getViewSteps();
    const idx = steps.indexOf(current);
    if (idx < 0 || idx >= steps.length - 1) return null;
    return steps[idx + 1];
  }

  function getPrevStep(current: number): number | null {
    const steps = getViewSteps();
    const idx = steps.indexOf(current);
    if (idx <= 0) return null;
    return steps[idx - 1];
  }

  function isValidStep(step: number): boolean {
    return getViewSteps().includes(step);
  }

  function spreadStartIndex(pageOrStep: number): number {
    if (pageOrStep === 0) return 0;
    return pageOrStep % 2 === 1 ? pageOrStep : pageOrStep - 1;
  }

  function getSpreadLabel(step: number): string {
    const steps = getViewSteps();
    if (step === 0) return "0";
    const last = steps[steps.length - 1];
    if (step === last && !steps.includes(step + 1)) return String(step);
    return `${step}_${step + 1}`;
  }

  function parseSpreadParam(param: string): number | null {
    const steps = getViewSteps();
    if (!param || steps.length === 0) return null;
    if (param === "0") return 0;
    const underscore = param.indexOf("_");
    if (underscore !== -1) {
      const first = parseInt(param.slice(0, underscore), 10);
      return Number.isNaN(first) || !isValidStep(first) ? null : first;
    }
    const n = parseInt(param, 10);
    if (Number.isNaN(n)) return null;
    if (n < 0) return null;
    if (n % 2 === 0 && n > 0) return spreadStartIndex(n);
    if (isValidStep(n)) return n;
    if (n === steps[steps.length - 1]) return n;
    return null;
  }

  function getArticleIndex(): { page_number: number; titulo: string }[] {
    const seen = new Set<string>();
    return sorted
      .filter((p) => p.page_type === "article" && p.titulo)
      .filter((p) => {
        const key = p.titulo!;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((p) => ({ page_number: p.page_number, titulo: p.titulo! }))
      .sort((a, b) => a.page_number - b.page_number);
  }

  return {
    pages: sorted,
    getViewSteps,
    getPageByNumber,
    getCompanyById,
    getPageNumbersForStep,
    getNextStep,
    getPrevStep,
    isValidStep,
    spreadStartIndex,
    getSpreadLabel,
    parseSpreadParam,
    getArticleIndex,
  };
}
