import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { isObject, validate } from 'class-validator';

const toValidate = (metatype: Function): boolean => {
  const types: Function[] = [String, Boolean, Number, Array, Object];
  return !types.includes(metatype);
};

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Skip validation for parameters or if no metadata type or if primitive
    if (metadata.type === 'param' || !metadata.metatype || !toValidate(metadata.metatype)) {
      return value;
    }
    
    if (!value) {
      return value;
    }

    const obj = plainToClass(metadata.metatype, value);
    const errors = await validate(obj);

    if (errors.length > 0) {
      const errorMessages = errors.map((error) => ({
        field: error.property,
        constraints: Object.values(error.constraints),
      }));

      throw new BadRequestException({ message: errorMessages[0].constraints[0] });
    }

    return obj;
  }
}