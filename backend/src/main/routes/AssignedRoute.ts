import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'tsyringe';
import { AssignedService } from '../services/AssignedService';
import { CommonRoutesConfig } from './CommonRoutesConfig';
import { checkJwt, checkRole } from '../middleware/JWTMiddleware';
import { Roles } from '../security/Roles';

@injectable()
export default class AssignedRoute extends CommonRoutesConfig {
  constructor(@inject('express-app') app: express.Application, private assignedService: AssignedService) {
    super(app, 'AssignedRoute');
  }

  configureRoutes(): express.Application {
    this.getApp()
      .route('/multipleAssigned')
      .post(
        checkJwt,
        checkRole(new Set([Roles.SUPERVISOR, Roles.EMPLOYEE])),
        async (req: express.Request, res: express.Response, next: express.NextFunction) => {
          try {
            const newAssign = await this.assignedService.createMultipleAssignment(req.body);
            res.status(StatusCodes.CREATED).send(newAssign);
          } catch (err) {
            next(err);
          }
        }
      );

    this.getApp()
      .route(`/assignedByTaskId/:taskid`)
      .all(checkJwt, checkRole(new Set([Roles.SUPERVISOR, Roles.EMPLOYEE])))
      .get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
          const employeeAccount = await this.assignedService.getAssignedsByTaskId(req.params.taskid);
          res.status(StatusCodes.OK).send(employeeAccount);
        } catch (err) {
          next(err);
        }
      })
      .post(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
          const nbChanged = await this.assignedService.updateAssignments(req.params.taskid, req.body);
          res.sendStatus(StatusCodes.CREATED).send(nbChanged);
        } catch (err) {
          next(err);
        }
      })
      .delete(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
          const nbDeleted = await this.assignedService.deleteAllByTaskId(req.params.taskid);
          res.sendStatus(StatusCodes.OK).send(nbDeleted);
        } catch (err) {
          next(err);
        }
      });
    return this.getApp();
  }
}
