import getWeek from 'date-fns/getWeek';

const ukenNr = (dag: Date): number => {
  return getWeek(dag, {
    weekStartsOn: 1
  });
};

export default ukenNr;
