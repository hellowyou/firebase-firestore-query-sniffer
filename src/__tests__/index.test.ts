import { createQuerySniffer, QueryMethods } from '../index'
import firebase from 'firebase/app'
import 'firebase/firestore'

firebase.initializeApp({
  projectId: 'test',
})

const db = firebase.firestore()

it('accepts collection', () => {
  const prox = createQuerySniffer(db.collection('collection'))
  expect(prox).toBeTruthy()
  expect(prox.queryTrace).toHaveLength(0)
})

it('accepts collection group', () => {
  const prox = createQuerySniffer(db.collectionGroup('collection'))
  expect(prox).toBeTruthy()
  expect(prox.queryTrace).toHaveLength(0)
})

it('should be immutable', () => {
  const prox = createQuerySniffer(db.collection('collection'))
  const prox2 = prox.where('field', '==', 'value')

  expect(prox).not.toBe(prox2)
  expect(prox.queryTrace).toHaveLength(0)
  expect(prox2.queryTrace).toHaveLength(1)
})

it.each`
  method           | args
  ${'limit'}       | ${[1]}
  ${'limitToLast'} | ${[1]}
  ${'orderBy'}     | ${['field', 'desc']}
  ${'where'}       | ${['path', '==', 'value']}
`(
  'should trace method $method',
  ({ method, args }: { method: QueryMethods; args: any[] }) => {
    const collection = db.collection('collection')
    const spy = jest.spyOn(collection, method)
    const prox = createQuerySniffer(collection)[method](...args)

    expect(spy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith(...args)
    expect(prox.queryTrace).toHaveLength(1)

    spy.mockRestore()
  }
)

it.each`
  method          | args
  ${'endAt'}      | ${['any']}
  ${'endBefore'}  | ${['any']}
  ${'startAfter'} | ${['any']}
  ${'startAt'}    | ${['any']}
`(
  'should trace pagination method $method',
  ({ method, args }: { method: QueryMethods; args: any[] }) => {
    const collection = db.collection('collection').orderBy('somefield')
    const spy = jest.spyOn(collection, method)
    const prox = createQuerySniffer(collection)[method](...args)

    expect(spy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith(...args)
    expect(prox.queryTrace).toHaveLength(1)

    spy.mockRestore()
  }
)
