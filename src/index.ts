import firebase from 'firebase'

type Query = firebase.firestore.Query

export type QueryMethods =
  | 'endAt'
  | 'endBefore'
  | 'limit'
  | 'limitToLast'
  | 'orderBy'
  | 'startAfter'
  | 'startAt'
  | 'where'

export interface Trace {
  method: string
  args: any[]
}

export interface ProxiedQuery extends Query {
  endAt(...args: Parameters<Query['endAt']>): this
  endBefore(...args: Parameters<Query['endBefore']>): this
  limit(...args: Parameters<Query['limit']>): this
  limitToLast(...args: Parameters<Query['limitToLast']>): this
  orderBy(...args: Parameters<Query['orderBy']>): this
  startAfter(...args: Parameters<Query['startAfter']>): this
  startAt(...args: Parameters<Query['startAt']>): this
  where(...args: Parameters<Query['where']>): this
  queryTrace: Trace[]
}

const queryMethods: QueryMethods[] = [
  'endAt',
  'endBefore',
  'limit',
  'limitToLast',
  'orderBy',
  'startAfter',
  'startAt',
  'where',
]

function includes(needle: any, haystack: any[]) {
  return haystack && haystack.findIndex((hay) => needle === hay) !== -1
}

function callReflect(oTarget: object, prop: string, args: any[]) {
  return Reflect.get(oTarget, prop).apply(oTarget, args)
}

function _createQuerySniffer(query: Query, lastTraces: Trace[] = []) {
  const traces = lastTraces.slice()

  const proxyHandler: ProxyHandler<firebase.firestore.CollectionReference> = {
    get: (oTarget, prop) => {
      if (typeof prop === 'symbol') {
        return Reflect.get(oTarget, prop)
      }

      if (prop === 'queryTrace') {
        return traces.slice()
      }

      if (includes(prop, queryMethods)) {
        return function (...args: any[]) {
          return _createQuerySniffer(
            callReflect(oTarget, prop, args) as Query,
            traces.concat({
              method: prop,
              args,
            })
          )
        }
      }

      return Reflect.get(oTarget, prop)
    },
  }

  return new Proxy(query, proxyHandler) as ProxiedQuery
}

export function createQuerySniffer(query: Query) {
  return _createQuerySniffer(query)
}
