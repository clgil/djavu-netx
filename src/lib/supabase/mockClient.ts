type QueryResult<T = any> = Promise<{ data: T; error: null; count?: number }>;

function createBuilder(initialData: any = []): any {
  const builder: any = {
    select() {
      return builder;
    },
    insert() {
      return builder;
    },
    update() {
      return builder;
    },
    delete() {
      return builder;
    },
    upsert() {
      return builder;
    },
    eq() {
      return builder;
    },
    neq() {
      return builder;
    },
    order() {
      return builder;
    },
    limit() {
      return builder;
    },
    single(): QueryResult<any> {
      return Promise.resolve({ data: null, error: null });
    },
    maybeSingle(): QueryResult<any> {
      return Promise.resolve({ data: null, error: null });
    },
    then(resolve: any, reject: any) {
      return Promise.resolve({ data: initialData, error: null, count: Array.isArray(initialData) ? initialData.length : 0 }).then(resolve, reject);
    },
  };

  return builder;
}

export function createMockSupabaseClient() {
  return {
    from() {
      return createBuilder([]);
    },
    auth: {
      onAuthStateChange(callback: any) {
        callback("SIGNED_OUT", null);
        return {
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        };
      },
      getSession() {
        return Promise.resolve({ data: { session: null }, error: null });
      },
      signInWithPassword() {
        return Promise.resolve({ data: { user: null, session: null }, error: null });
      },
      signUp() {
        return Promise.resolve({ data: { user: null, session: null }, error: null });
      },
      signOut() {
        return Promise.resolve({ error: null });
      },
    },
  } as any;
}
