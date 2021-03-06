import * as Yup from 'yup';

const today = new Date();
today.setHours(0, 0, 0, 0);

const createTaskFormValidationSchema: Yup.ObjectSchema<any> = Yup.object().shape({
  title: Yup.string().required('Required'),
  deadlineDate: Yup.date().required('Required').min(today, 'Date cannot be in the past').nullable(),
});

export default createTaskFormValidationSchema;
