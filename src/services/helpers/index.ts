import { OrderItem } from 'sequelize/types';
import { OrderDirection } from '../../models/common/models.enum';

export const getOrderQuery = (
  sortNames?: string[],
  sortDirections?: OrderDirection[],
) => {
  let order: OrderItem[] = [];

  if (
    !sortNames ||
    !sortDirections ||
    !sortDirections.length ||
    !sortNames.length
  ) {
    return [['createdAt', OrderDirection.DESC]];
  }

  for (let i = 0; i < sortNames.length; i++) {
    const sortName = sortNames[i];
    const sortDirection = sortDirections[i];

    order.push([sortName, sortDirection]);
  }

  return order;
};
