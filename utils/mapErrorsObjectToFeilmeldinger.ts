export default function mapErrorsObjectToFeilmeldinger(errors) {
  const mapErrorsObject = (errors: any, subKey = ''): any[] => {
    return Object.keys(errors).flatMap((key) => {
      if (typeof errors[key] === 'string') {
        console.log('errors[key]', errors[key]);
        return {
          key: subKey ? `${subKey}.${key}` : key,
          message: errors[key]
        };
      }

      if (!errors[key].message) {
        console.log('!errors[key].message', errors[key]);
        return mapErrorsObject(errors[key], subKey ? `${subKey}.${key}` : key);
      }

      return {
        key: subKey ? `${subKey}.${key}` : key,
        message: errors[key].message
      };
    });
  };
  const errorsMapped = mapErrorsObject(errors);

  const feilmeldinger = errorsMapped.map((error) => {
    return {
      felt: error.key,
      text: error.message
    };
  });
  return feilmeldinger;
}
