import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../../../logger';
import * as Yup from 'yup';

import authConfig from '../../../config/auth';
import User from '../../models/User';

class SessionController {
  async store (req: Request, res: Response): Promise<Response> {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    await schema.validate(req.body).catch((err) => {
      return res.status(400).json({ error: err.message });
    })

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) return res.status(401).json({ error: 'User not found' });

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({
        error: 'Password does not match'
      });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
