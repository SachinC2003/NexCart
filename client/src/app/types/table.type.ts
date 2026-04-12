export type TableCell = string | number | boolean | null | undefined;
export type TableRow = TableCell[];

export default interface Table{
    name: string,
    columns: string[]
    data?: TableRow[],
    actionButtons?: {
        label: string,
        callback: (rowData: TableRow) => void
    }[]
}
