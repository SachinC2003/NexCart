

export class Utils {
  public formatNumber(value: number | undefined): string {
    return new Intl.NumberFormat('en-IN').format(value ?? 0);
  }

  public toTitleCase(value: string): string {
    return value
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

}