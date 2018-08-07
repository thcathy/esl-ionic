export interface Grade {
  id: number;
  title: string;
  longTitle: string;
  description: string;
  level: number;
  phoneticPracticeLvUpRequire: number;
  phoneticSymbolPracticeLvUpRequire: number;
  createdDate: Date;
  notTopGrade: boolean;
}
