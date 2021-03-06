/**
 * @fileoverview Authentication HOC
 */
import * as React from 'react';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import cookie from 'js-cookie';
import { NextComponentType } from 'next';

import TokenContext, { Token } from '../components/TokenContext';

interface WithTokenProps {
  token: Token;
}

export const login = async ({ token }: { token: string }) => {
  cookie.set('token', token, { expires: 1 });
  Router.push('/');
};

export const logout = () => {
  cookie.remove('token');
  // to support logging out from all windows
  window.localStorage.setItem('logout', String(Date.now()));
  Router.push('/login');
};

export const auth = (ctx: any) => {
  const { token } = nextCookie(ctx);

  /*
   * This happens on server only, ctx.req is available means it's being
   * rendered on server. If we are on server and token is not available,
   * means user is not logged in.
   */
  if (ctx.req && !token) {
    ctx.res.writeHead(302, { Location: '/login' });
    ctx.res.end();
    return null;
  }

  // We already checked for server. This should only happen on client.
  if (!token) {
    Router.push('/login');
    return null;
  }

  return token;
};

// Gets the display name of a JSX component for dev tools
const getDisplayName = (Component: any) =>
  Component.displayName || Component.name || 'Component';

const withAuthSync = <P extends {}>(
  WrappedComponent: NextComponentType<P, any, any>
) =>
  class extends React.Component<P & WithTokenProps> {
    static displayName = `withAuthSync(${getDisplayName(WrappedComponent)})`;

    static async getInitialProps(ctx: any) {
      const token = auth(ctx);

      if (token) {
        const componentProps =
          WrappedComponent.getInitialProps &&
          (await WrappedComponent.getInitialProps(ctx));

        return { ...componentProps, token };
      }
      return null;
    }

    componentDidMount() {
      window.addEventListener('storage', this.syncLogout);
    }

    componentWillUnmount() {
      window.removeEventListener('storage', this.syncLogout);
      window.localStorage.removeItem('logout');
    }

    syncLogout = (event: any) => {
      if (event.key === 'logout') {
        console.log('logged out from storage!');
        Router.push('/login');
      }
    };

    render() {
      const { token, ...props } = this.props;
      return (
        <TokenContext.Provider value={token}>
          <WrappedComponent {...props as P} />
        </TokenContext.Provider>
      );
    }
  };
export default withAuthSync;
