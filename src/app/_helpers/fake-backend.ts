import {Injectable} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {delay, dematerialize, materialize} from 'rxjs/operators';

// array in local storage for registered users
const usersKey = 'registration-users';
let users = JSON.parse(localStorage.getItem(usersKey)) || [];

// array in local storage for registered employees
const employeesKey = 'registration-employee';
let employees = JSON.parse(localStorage.getItem(employeesKey)) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const {url, method, headers, body} = request;

    return handleRoute();

    function handleRoute() {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/users/register') && method === 'POST':
          return register();
        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        case url.match(/\/users\/\d+$/) && method === 'GET':
          return getUserById();
        case url.match(/\/users\/\d+$/) && method === 'PUT':
          return updateUser();
        case url.match(/\/users\/\d+$/) && method === 'DELETE':
          return deleteUser();

        case url.endsWith('/employee/register') && method === 'POST':
          return registerEmployee();
        case url.endsWith('/employee') && method === 'GET':
          return getEmployee();
        case url.match(/\/employee\/\d+$/) && method === 'GET':
          return getEmployeeById();
        case url.match(/\/employee\/\d+$/) && method === 'PUT':
          return updateEmployee();
        case url.match(/\/employee\/\d+$/) && method === 'DELETE':
          return deleteEmployee();
        default:
          // pass through any requests not handled above
          return next.handle(request);
      }
    }

    // route functions

    function authenticate() {
      const {username, password} = body;
      const user = users.find(x => x.username === username && x.password === password);
      if (!user) {
        return error('Username or password is incorrect');
      }
      return ok({
        ...basicDetails(user),
        token: 'fake-jwt-token'
      });
    }

    function register() {
      const user = body;

      if (users.find(x => x.username === user.username)) {
        return error('Username "' + user.username + '" is already taken');
      }

      user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
      users.push(user);
      localStorage.setItem(usersKey, JSON.stringify(users));
      return ok();
    }

    function registerEmployee() {
      const employee = body;


      if (employees.find(x => x.userName === employee.userName)) {
        return error('Username "' + employee.userName + '" is already taken');
      }

      employee.id = employees.length ? Math.max(...employees.map(x => x.id)) + 1 : 1;
      employees.push(employee);
      localStorage.setItem(employeesKey, JSON.stringify(employees));
      return ok();
    }

    function getUsers() {
      if (!isLoggedIn()) {
        return unauthorized();
      }
      return ok(users.map(x => basicDetails(x)));
    }

    function getUserById() {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      const user = users.find(x => x.id === idFromUrl());
      return ok(basicDetails(user));
    }

    function getEmployeeById() {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      const employee = employees.find(x => x.id === idFromUrl());
      return ok(basicEmployeeDetails(employee));
    }

    function updateUser() {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      let params = body;
      let user = users.find(x => x.id === idFromUrl());

      // only update password if entered
      if (!params.password) {
        delete params.password;
      }

      // update and save user
      Object.assign(user, params);
      localStorage.setItem(usersKey, JSON.stringify(users));

      return ok();
    }

    function deleteUser() {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      users = users.filter(x => x.id !== idFromUrl());
      localStorage.setItem(usersKey, JSON.stringify(users));
      return ok();
    }


    function getEmployee() {
      if (!isLoggedIn()) {
        return unauthorized();
      }
      return ok(employees.map(x => basicEmployeeDetails(x)));
    }


    function updateEmployee() {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      let params = body;
      let employee = employees.find(x => x.id === idFromUrl());

      if (employees.find(x => x.userName === params.userName)) {
        return error('Username "' + params.userName + '" is already taken');
      }

      // update and save user
      Object.assign(employee, params);
      localStorage.setItem(employeesKey, JSON.stringify(employees));

      return ok();
    }

    function deleteEmployee() {
      if (!isLoggedIn()) {
        return unauthorized();
      }

      employees = employees.filter(x => x.id !== idFromUrl());
      localStorage.setItem(employeesKey, JSON.stringify(employees));
      return ok();
    }

    // helper functions

    function ok(body?) {
      return of(new HttpResponse({status: 200, body}))
        .pipe(delay(500)); // delay observable to simulate server api call
    }

    function error(message) {
      return throwError({error: {message}})
        .pipe(materialize(), delay(500), dematerialize()); // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648);
    }

    function unauthorized() {
      return throwError({status: 401, error: {message: 'Unauthorized'}})
        .pipe(materialize(), delay(500), dematerialize());
    }

    function basicDetails(user) {
      const {id, username, firstName, lastName} = user;
      return {id, username, firstName, lastName};
    }

    function basicEmployeeDetails(employee) {
      const {id, userName, firstName, lastName, email, birthDate, basicSalary, status, group, description} = employee;
      return {id, userName, firstName, lastName, email, birthDate, basicSalary, status, group, description};
    }

    function isLoggedIn() {
      return headers.get('Authorization') === 'Bearer fake-jwt-token';
    }

    function idFromUrl() {
      const urlParts = url.split('/');
      return parseInt(urlParts[urlParts.length - 1]);
    }
  }
}

export const fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
