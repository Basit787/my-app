import type { FilterQuery, HydratedDocument, Model, UpdateQuery } from "mongoose";

// Shared data access for one collection; feature repositories add their domain queries on top
export abstract class BaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  create(data: Partial<T>): Promise<HydratedDocument<T>> {
    return this.model.create(data) as Promise<HydratedDocument<T>>;
  }

  findById(id: string): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id).exec();
  }

  findOne(filter: FilterQuery<T>): Promise<HydratedDocument<T> | null> {
    return this.model.findOne(filter).exec();
  }

  updateById(id: string, update: UpdateQuery<T>): Promise<HydratedDocument<T> | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async deleteMany(filter: FilterQuery<T>): Promise<void> {
    await this.model.deleteMany(filter).exec();
  }

  save(doc: HydratedDocument<T>): Promise<HydratedDocument<T>> {
    return doc.save() as unknown as Promise<HydratedDocument<T>>;
  }
}
