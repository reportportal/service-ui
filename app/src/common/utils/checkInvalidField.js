export default function checkInvalidField(field, formShowError) {
  return !field.isValid && (!field.isPristine || formShowError);
}
