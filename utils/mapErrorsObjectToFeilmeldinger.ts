export default function mapErrorsObjectToFeilmeldinger(errors) {
  const mapErrorsObject = (errors: any, subKey = ''): any[] => {
    return Object.keys(errors).flatMap((key) => {
      if (!errors[key].message) {
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
