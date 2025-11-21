## 1. Implementation

- [x] 1.1 Register LoginHistory entity in UsersModule (`TypeOrmModule.forFeature([User, LoginHistory])`)
- [x] 1.2 Inject LoginHistory repository into UsersService constructor
- [x] 1.3 Replace getLatestMobileLoginForUser raw SELECT with `loginHistoryRepo.findOne({ where: { accountId: id }, order: { loginAt: 'DESC' }, select: ['loginAt','appId','appName','appVersion','appModule'] })`
- [x] 1.4 Replace findLoginHistoryByUserId raw SELECT with ORM query (`find` or QueryBuilder) and map to the existing DTO shape
- [x] 1.5 Keep DTOs and response shapes unchanged (fields, ordering, limit semantics)
- [x] 1.6 Remove any now-unused imports or code paths

## 2. Tests & Verification

- [x] 2.1 Unit: add tests for getLatestMobileLoginForUser to verify correct field mapping and ordering
- [x] 2.2 Unit: add tests for findLoginHistoryByUserId to verify limit and ordering
- [x] 2.3 E2E: smoke path that renders user login history remains unchanged
- [x] 2.4 Lint/Types: run type-check and lint; fix any issues

## 3. Operational

- [x] 3.1 Confirm no performance regression (TOP emitted for `take()` on MSSQL)
- [x] 3.2 Document the refactor in PR description linking this change
