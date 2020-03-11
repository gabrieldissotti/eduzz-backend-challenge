import { Request, Response } from 'express';
import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  /**
   * @swagger
   *
   * /users:
   *    post:
   *      tags:
   *        - Users
   *      name: Create User
   *      summary: create a user
   *      produces:
   *        - application/json
   *      consumes:
   *        - application/json
   *      description: "
   *
   *  - The password must be longer then 6 characters \n
   *  - The password, name and email are required \n
   *  - The email must be valid
   *
   * "
   *      requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *            examples:
   *              user:
   *                value:
   *                  name: 'Gabriel Dissotti'
   *                  email: 'gabrieldnrodrigues@gmail.com'
   *                  password: '123456'
   *      responses:
   *        200:
   *          description: success
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/definitions/User'
   *        500:
   *          description: internal server error
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  error:
   *                    type: string
   *                    example: 'Timeout'
   */
  async store (req: Request, res: Response): Promise<Response> {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string()
          .email()
          .required(),
        password: Yup.string()
          .required()
          .min(6),
      });

      await schema.validate(req.body).catch((err) => {
        return res.status(400).json({ error: err.message || 'Validation fails' });
      })

      const userExists = await User.findOne({
        where: { email: req.body.email },
      });

      if (userExists) { return res.status(400).json({ error: 'User already exists!' }); }

      const { id, name, email } = await User.create(req.body);

      return res.json({ id, name, email });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new UserController();
