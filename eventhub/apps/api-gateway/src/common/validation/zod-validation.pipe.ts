
import {
  Injectable,
  PipeTransform,
  ArgumentMetadata
} from "@nestjs/common";
import { z } from "zod";
import { RequestValidationFailed } from "../problem/domain-errors";

function hasZodSchema(
  value: unknown
): value is { zodSchema: z.ZodTypeAny } {
  return (
    typeof value === "function" &&
    "zodSchema" in value
  );
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(
    value: unknown,
    metadata: ArgumentMetadata
  ): unknown {
    const dto = metadata.metatype;

    if (!hasZodSchema(dto)) {
      return value;
    }

    const result = dto.zodSchema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    throw new RequestValidationFailed(
      result.error.issues.map((i) => ({
        field: i.path.join(".") || "(корінь)",
        code: i.code,
        message: i.message
      }))
    );
  }
}
