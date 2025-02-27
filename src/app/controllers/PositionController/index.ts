import { Response } from 'express';
import { Request } from '../../middlewares/auth';
import * as Yup from 'yup';
import logger from '../../../logger';

import Transaction from '../../models/Transaction';

import MercadoBitcoinApi from '../../services/mercadobitcoin';

class PositionController {
  async index (req: Request, res: Response): Promise<Response> {
    const schema = Yup.object().shape({
      pagesize: Yup.number().integer(),
      page: Yup.number().integer(),
    });

    await schema.validate(req.body).catch((err) => {
      return res.status(400).json({ error: err.message });
    })

    const {
      pagesize,
      page,
    } = req.query;

    const limit = Number(pagesize || 30);

    const offset = page ? (Number(page) - 1) * limit : 0;

    const { data } = await MercadoBitcoinApi.get('/BTC/ticker/')

    const transactions = await Transaction.findAndCountAll({
      limit,
      offset,
      where: {
        type: 'purchase',
        user_id: req.userId,
        status: 'normal'
      },
      include: [
        {
          model: Transaction,
          as: 'parent'
        },
      ]
    })

    if (!(transactions?.rows?.length > 0)) {
      return res.json(transactions);
    }

    const response = {
      count: transactions.count,
      rows: transactions.rows.map(transaction => ({
        id: transaction.id,
        currency_purchase_value_in_brl: transaction.currency_purchase_value_in_brl,
        currency_liquidate_value_in_brl: transaction.currency_liquidate_value_in_brl,
        current_currency_purchase_value_in_brl: data.ticker.buy,
        current_currency_liquidate_value_in_brl: data.ticker.sell,
        purchased_brl_amount: transaction.parent.amount,
        current_brl_amount: Transaction.convertMoney({
          type: 'BTC_TO_BRL',
          amount: transaction.amount,
          quote: data.ticker.sell,
        }),
        btc_variation: Transaction.getVariation({
          initialValue: transaction.currency_purchase_value_in_brl,
          currentValue: data.ticker.buy
        }),
        date: transaction.date,
      }))
    }

    return res.json(response)
  }
}

export default new PositionController();
