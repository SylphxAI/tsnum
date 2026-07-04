// ===== Functional Programming Utilities =====

type Fn<A, B> = (a: A) => B

// ===== Pipe utility (compose left-to-right) =====
export function pipe<A>(value: A): A
export function pipe<A, B>(value: A, fn1: Fn<A, B>): B
export function pipe<A, B, C>(value: A, fn1: Fn<A, B>, fn2: Fn<B, C>): C
export function pipe<A, B, C, D>(value: A, fn1: Fn<A, B>, fn2: Fn<B, C>, fn3: Fn<C, D>): D
export function pipe<A, B, C, D, E>(
  value: A,
  fn1: Fn<A, B>,
  fn2: Fn<B, C>,
  fn3: Fn<C, D>,
  fn4: Fn<D, E>,
): E
export function pipe<A, B, C, D, E, F>(
  value: A,
  fn1: Fn<A, B>,
  fn2: Fn<B, C>,
  fn3: Fn<C, D>,
  fn4: Fn<D, E>,
  fn5: Fn<E, F>,
): F
export function pipe(value: any, ...fns: Fn<any, any>[]): any {
  return fns.reduce((acc, fn) => fn(acc), value)
}

// ===== Compose utility (compose right-to-left) =====
export function compose<A, B>(fn1: Fn<A, B>): Fn<A, B>
export function compose<A, B, C>(fn2: Fn<B, C>, fn1: Fn<A, B>): Fn<A, C>
export function compose<A, B, C, D>(fn3: Fn<C, D>, fn2: Fn<B, C>, fn1: Fn<A, B>): Fn<A, D>
export function compose<A, B, C, D, E>(
  fn4: Fn<D, E>,
  fn3: Fn<C, D>,
  fn2: Fn<B, C>,
  fn1: Fn<A, B>,
): Fn<A, E>
export function compose(...fns: Fn<any, any>[]): Fn<any, any> {
  return (value: any) => fns.reduceRight((acc, fn) => fn(acc), value)
}

// ===== Partial application helper =====
export function partial<A, B, C>(fn: (a: A, b: B) => C, a: A): (b: B) => C {
  return (b: B) => fn(a, b)
}
