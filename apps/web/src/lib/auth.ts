// Shim: resolves @/lib/auth -> @houselevi/auth
// tsconfig paths: "@/*" -> ["./*"], so @/lib/auth -> ./lib/auth (this file)
export * from '@houselevi/auth';