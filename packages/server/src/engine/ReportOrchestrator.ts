import { DataService } from '../services/DataService';
import { assembleReport } from './ReportAssembler';
import {
  ExecutiveSummarySection,
  PESTSection,
  PolicyDeepDiveSection,
  IndustryChainSection,
  SupplyDemandSection,
  LifecycleSection,
  GongDiFangSpecialSection,
  DisposalStrategySection,
} from './sections';
import type { SectionContext } from './sections';
import type { ReportConfig, ReportDocument, SectionOutput } from '@report-gen/shared';
import type { BaseSection } from './sections/BaseSection';

export class ReportOrchestrator {
  private dataService: DataService;
  private sectionRegistry: Map<string, BaseSection>;

  constructor(dataService: DataService) {
    this.dataService = dataService;
    this.sectionRegistry = new Map();

    this.registerSection(new ExecutiveSummarySection());
    this.registerSection(new PESTSection());
    this.registerSection(new PolicyDeepDiveSection());
    this.registerSection(new IndustryChainSection());
    this.registerSection(new SupplyDemandSection());
    this.registerSection(new LifecycleSection());
    this.registerSection(new GongDiFangSpecialSection());
    this.registerSection(new DisposalStrategySection());
  }

  private registerSection(section: BaseSection): void {
    this.sectionRegistry.set(section.id, section);
  }

  async generate(id: string, config: ReportConfig, forceRefresh = false): Promise<ReportDocument> {
    // 1. Fetch all required data
    const scrapedData = await this.dataService.fetchAllData(config.cities, forceRefresh);

    // 2. Determine enabled sections
    const enabledConfigs = config.sections.filter(s => s.enabled);
    const enabledSections = enabledConfigs
      .map(sc => this.sectionRegistry.get(sc.id))
      .filter((s): s is BaseSection => s !== undefined)
      .sort((a, b) => a.order - b.order);

    // 3. Generate sections in order (executive summary last so it can reference others)
    const nonExecutiveSections = enabledSections.filter(s => s.id !== 'executive_summary');
    const executiveSection = enabledSections.find(s => s.id === 'executive_summary');

    const completedSections: SectionOutput[] = [];

    const baseContext: Omit<SectionContext, 'allSections'> = {
      scrapedData,
      config,
    };

    // Generate non-executive sections first
    for (const section of nonExecutiveSections) {
      const output = section.generate({
        ...baseContext,
        allSections: completedSections,
      });
      completedSections.push(output);
    }

    // Generate executive summary last
    if (executiveSection) {
      const output = executiveSection.generate({
        ...baseContext,
        allSections: completedSections,
      });
      completedSections.push(output);
    }

    // 4. Assemble report
    const generatedAt = new Date().toISOString();
    return assembleReport(id, config, completedSections, generatedAt);
  }
}
