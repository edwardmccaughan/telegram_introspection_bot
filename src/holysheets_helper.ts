// TODO: this is duplicated from Holysheets, since it's needed for typing
// but the library doesn't export it?

export interface SheetRecord<RecordType extends Record<string, string>> {
  range: string;
  row: number;
  fields: Partial<RecordType>;
}

