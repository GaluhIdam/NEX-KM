export interface StatisticDTO {
  totalAllCreations: number;
  totalCreationCurrentMonth: number;
  totalCreationBeforeMonth: number;
  totalCreationPublished: number;
  totalCreationNeedApproval: number;
  isCurrentMonthGreaterThanBeforeMonth: boolean;
  totalCurrentMonthPersentage: number;
}
