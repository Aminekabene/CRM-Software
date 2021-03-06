import './App.css';
import { makeStyles, ThemeProvider } from '@material-ui/core';
import { mainTheme } from './configs/MuiConfig';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import React, { lazy, Suspense, useEffect } from 'react';
import LandingPage from './components/Shared/LandingPage';
import Sidebar from './components/Sidebar/Sidebar';
import axios, { AxiosResponse } from 'axios';
import localStorageService from './services/LocalStorageService';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { getAccount, selectAccount, noTokenReducer } from './features/account/AccountSlice';
import { loginWithRefreshToken } from './services/AccountAPI';
const ViewCallLogs = lazy(() => import('./components/CommunicationLogs/ViewCallLogs'));
const BookedProjects = lazy(() => import('./components/Project/BookedProjects'));
const SingleProjectTransaction = lazy(() => import('./components/Transactions/SingleProjectTransaction'));
const MyCalendar = lazy(() => import('./components/Calendar/MyCalendar'));
const EventConfirmation = lazy(() => import('./components/Calendar/EventConfirmation'));
const FAQ = lazy(() => import('./components/FAQ/FAQ'));
const Financials = lazy(() => import('./components/Project/Financials'));
const CreateEmployee = lazy(() => import('./components/CreateEmployee/CreateEmployee'));
const Login = lazy(() => import('./components/Login/Login'));
const CreateClientAccount = lazy(() => import('./components/CreateClientAccount/CreateClientAccount'));
const CreateProject = lazy(() => import('./components/Project/CreateProject'));
const ViewProject = lazy(() => import('./components/Project/ViewProject'));
const EditProject = lazy(() => import('./components/Project/EditProject'));
const PageNotFound = lazy(() => import('./components/Shared/PageNotFound'));
const CreateBusinessAccount = lazy(() => import('./components/CreateBusinessAccount/CreateBusinessAccount'));
const TaskList = lazy(() => import('./components/Task/TaskList'));
const CreateTask = lazy(() => import('./components/Task/CreateTask'));
const EditTask = lazy(() => import('./components/Task/EditTask'));
const ViewPay = lazy(() => import('./components/Employees/ViewPay'));
const LogHours = lazy(() => import('./components/Employees/LogHours/LogHours'));
const ViewBusiness = lazy(() => import('./components/Business/ViewBusiness'));
const RootPage = lazy(() => import('./components/Root/Root'));

const App = () => {
  const account = useAppSelector(selectAccount);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!account.authenticated && localStorageService.getRefreshToken()) {
      loginWithRefreshToken(localStorageService.getRefreshToken() as string)
        .then((res) => {
          localStorageService.setToken({
            accessToken: res.data.access_token,
            idToken: res.data.id_token,
            refreshToken: localStorageService.getRefreshToken() as string,
          });
          localStorageService.setBearerToken();
          dispatch(getAccount());
        })
        .catch(() => {
          localStorageService.clearAllTokens();
        });
    } else {
      dispatch(noTokenReducer());
    }
  }, [account.authenticated, account.loading, account.account.role, dispatch]);

  axios.interceptors.response.use(
    (response: AxiosResponse<any>) => {
      return response;
    },
    (error) => {
      if (error.response.data.message === 'jwt expired') {
        const request = error.config;
        delete axios.defaults.headers.common.Authorization;
        delete request.headers.Authorization;

        loginWithRefreshToken(localStorageService.getRefreshToken() as string)
          .then((res) => {
            localStorageService.setToken({
              accessToken: res.data.access_token,
              idToken: res.data.id_token,
              refreshToken: localStorageService.getRefreshToken() as string,
            });
            localStorageService.setBearerToken();
          })
          .catch((_err) => {
            localStorageService.clearAllTokens();
            return Promise.reject(new Error('Request failed due to credential, try re-login'));
          });
      } else {
        return Promise.reject(error);
      }
    }
  );

  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
  const rootStyles = makeStyles((_theme) => ({
    calendar: {
      backgroundColor: '#fff',
      padding: 24,
      '& .rbc-calendar': {
        height: '87.5vh',
      },
    },
  }));

  const className = rootStyles();
  return (
    <Router>
      <ThemeProvider theme={mainTheme}>
        <div className="App">
          <Suspense fallback={<LandingPage />}>
            <Switch>
              <Route
                exact
                path="/financials"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'SUPERVISOR' ||
                        account.account.role === 'BUSINESS'
                      ) {
                        return (
                          <React.Fragment>
                            <Sidebar />
                            <Financials />
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              ></Route>
              <Route
                exact
                path="/project"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'SUPERVISOR' ||
                        account.account.role === 'BUSINESS'
                      ) {
                        return (
                          <React.Fragment>
                            <Sidebar />
                            <CreateProject edit="false" />
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/project/:id"
                render={({ match }) => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'EMPLOYEE' ||
                        account.account.role === 'SUPERVISOR' ||
                        account.account.role === 'BUSINESS'
                      ) {
                        return (
                          <React.Fragment>
                            <Sidebar />
                            <EditProject id={match.params.id} />
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/projects"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'EMPLOYEE' ||
                        account.account.role === 'SUPERVISOR' ||
                        account.account.role === 'BUSINESS'
                      ) {
                        return (
                          <React.Fragment>
                            <Sidebar />
                            <ViewProject />
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/employees"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'SUPERVISOR' ||
                        account.account.role === 'BUSINESS'
                      ) {
                        return (
                          <React.Fragment>
                            <Sidebar />
                            <ViewPay />
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/pay/new"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'SUPERVISOR' ||
                        account.account.role === 'BUSINESS'
                      ) {
                        return (
                          <React.Fragment>
                            <Sidebar />
                            <LogHours editMode={false} />
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/pay/edit/:id"
                render={({ match }) => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'SUPERVISOR' ||
                        account.account.role === 'BUSINESS'
                      ) {
                        return (
                          <React.Fragment>
                            <Sidebar />
                            <LogHours editMode={true} id={match.params.id} />
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/error"
                render={() => (
                  <React.Fragment>
                    <Sidebar />
                    <PageNotFound />
                  </React.Fragment>
                )}
              />
              <Route
                exact
                path="/businessAccount/new"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (account.account.role === 'ADMIN') {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <CreateBusinessAccount />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/clientAccount/new"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (account.account.role === 'ADMIN' || account.account.role === 'BUSINESS') {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <CreateClientAccount />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/employeeAccount/new"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (account.account.role === 'ADMIN' || account.account.role === 'BUSINESS') {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <CreateEmployee />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/logs"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'BUSINESS' ||
                        account.account.role === 'EMPLOYEE' ||
                        account.account.role === 'SUPERVISOR'
                      ) {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <ViewCallLogs />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/tasks"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'EMPLOYEE' ||
                        account.account.role === 'SUPERVISOR'
                      ) {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <TaskList />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/tasks/new"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'EMPLOYEE' ||
                        account.account.role === 'SUPERVISOR'
                      ) {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <CreateTask edit="false" />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/tasks/edit/:id"
                render={({ match }) => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'EMPLOYEE' ||
                        account.account.role === 'SUPERVISOR'
                      ) {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <EditTask id={match.params.id} edit="true" />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/booked_projects_transactions"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'SUPERVISOR' ||
                        account.account.role === 'BUSINESS'
                      ) {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <BookedProjects />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/project_transaction/:id"
                render={({ match }) => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (
                        account.account.role === 'ADMIN' ||
                        account.account.role === 'SUPERVISOR' ||
                        account.account.role === 'BUSINESS'
                      ) {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <SingleProjectTransaction id={match.params.id} />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/business"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (account.account.role === 'ADMIN') {
                        return (
                          <React.Fragment>
                            <div>
                              <Sidebar />
                              <ViewBusiness />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/business/edit/:id"
                render={({ match }) => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (account.account.role === 'ADMIN') {
                        return (
                          <React.Fragment>
                            <div style={{ paddingTop: '75px' }}>
                              <Sidebar />
                              <CreateBusinessAccount editMode={true} id={match.params.id} />
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/login"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      return <Redirect to="/" />;
                    } else {
                      return <Login />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/calendar"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      if (account.account.role === 'ADMIN' || account.account.role === 'EMPLOYEE') {
                        return (
                          <>
                            <Sidebar />
                            <div style={{ marginTop: '75px' }} className={className.calendar}>
                              <MyCalendar />
                            </div>
                          </>
                        );
                      } else {
                        return <Redirect to="/" />;
                      }
                    } else {
                      return <Login />;
                    }
                  }
                }}
              />
              <Route exact path="/event/invitation/status" render={() => <EventConfirmation />} />
              <Route
                exact
                path="/faq"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      return (
                        <React.Fragment>
                          <div>
                            <Sidebar />
                            <FAQ />
                          </div>
                        </React.Fragment>
                      );
                    } else {
                      return <Login />;
                    }
                  }
                }}
              />
              <Route
                exact
                path="/"
                render={() => {
                  if (account.loading) {
                    return <></>;
                  } else {
                    if (account.authenticated) {
                      return (
                        <React.Fragment>
                          <div style={{ paddingTop: '75px' }}>
                            <Sidebar />
                            <RootPage />
                          </div>
                        </React.Fragment>
                      );
                    } else {
                      return <Redirect to="/login" />;
                    }
                  }
                }}
              />
              <Route path="*" render={() => <PageNotFound />} />
            </Switch>
          </Suspense>
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App;
