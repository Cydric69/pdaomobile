// utils/transform.ts
export class DataTransformer {
  /**
   * Transform Zod data to Mongoose-compatible data
   */
  static toMongoose<T>(data: T): any {
    if (!data || typeof data !== "object") return data;

    const transformed = { ...(data as any) };

    // Convert string dates to Date objects
    if (
      transformed.date_of_birth &&
      typeof transformed.date_of_birth === "string"
    ) {
      transformed.date_of_birth = new Date(transformed.date_of_birth);
    }

    // Transform disability_info dates
    if (
      transformed.disability_info &&
      Array.isArray(transformed.disability_info)
    ) {
      transformed.disability_info = transformed.disability_info.map(
        (disability: any) => ({
          ...disability,
          diagnosis_date: disability.diagnosis_date
            ? new Date(disability.diagnosis_date)
            : undefined,
        }),
      );
    }

    return transformed;
  }

  /**
   * Transform Mongoose document to plain object
   */
  static toPlain(document: any): any {
    if (!document) return document;

    const obj = document.toObject ? document.toObject() : document;

    // Remove Mongoose internal fields
    delete obj.__v;
    delete obj.password;

    return obj;
  }
}
