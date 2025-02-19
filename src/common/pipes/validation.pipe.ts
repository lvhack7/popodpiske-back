import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { isObject, validate } from 'class-validator';


@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Skip validation for parameters or if no metadata type
    if (metadata.type === 'param') {
      return value;
    }
    
    // Handle the case where the value is null or undefined
    if (!value) {
      return value;
    }

    // If the incoming data is form data, handle it appropriately
    // For form data, `value` might be a string or an object with string values
    const metatype = metadata.metatype;
    if (isObject(value) && metatype) {
      const obj = plainToClass(metatype, value);
      const errors = await validate(obj);

      if (errors.length > 0) {
        // Customize the error response here to make it user-friendly
        const errorMessages = errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints),
        }));

        throw new BadRequestException({ message: errorMessages[0].constraints[0] });
      }

      return obj; // Return transformed object if validation passes
    }

    return value; // Return original value if no transformation or validation needed
  }
}