# **UTARi Accommodation Server**

This is the server of UTARi-client

## Tech Used

| Aspect                                                                 | Name           |
| ---------------------------------------------------------------------- | -------------- |
| Development Language                                                   | TypeScipt      |
| Scripting Language                                                     | JavaScript     |
| Bundling                                                               | Esbuild        |
| Testing                                                                | Jest           |
| Run-time Environment                                                   | NodeJS         |
| Database                                                               | PostgreSQL     |
| TypeScript Code Gen from raw SQL                                       | PgTyped        |
| Authentication Service                                                 | Firebase       |
| Build Automation Tool                                                  | Make           |
| Text Editor                                                            | NeoVim         |
| Dependency Management                                                  | Yarn           |
| Continuous Integration, Continuous Delivery, and Continuous Deployment | GitHub Actions |

## How to build this app?

_*Make sure you have `yarn` and `make` available in your system*_

### Environment Variables

#### Development

Refer to `.env.example` which is an example file for you to know what key-value pairs are needed to develop this project

Then, create an `.env` file. Then copy the key-value pairs to it and then add the values

#### Testing

Refer to `.env.test.example` which is an example file for you to know what key-value pairs are needed to test this project

Then, create an `.env.test` file. Then copy the key-value pairs to it and then add the values

#### Make Commands

_*Below are the listed commands that you can use to build/develop/test this app*_

| Command                 | Usage                                             |
| ----------------------- | ------------------------------------------------- |
| make start              | Start development                                 |
| make test               | Run all test code                                 |
| make build              | Bundle and build the app                          |
| make typecheck          | Run typechecking for source and test code         |
| make lint               | Run linter for source and test code               |
| make format-check       | Run prettier to check source and test code format |
| make format             | Run prettier to format source and test code       |
| make install            | Install all dependencies                          |
| make install-postgresql | Install PostgreSQL                                |
| make setup-postgresql   | Setup PostgreSQL                                  |
