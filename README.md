# Sample Project
### Run the application

From the current folder, you can execute these command

```shell
# To build the application (see dist folder) ready to be deployed on a web server
$ yarn run build

# To start the server in development mode. This is the command you will use to debug the
# application.
$ yarn run dev

# To create a Debian package
# Only useful when you are on a Linux debian system, this create a debian package that you can
# install using `dpkg - i <package>.deb`
$ yarn run pkg:deb

# To lint the source code, this command should always be executed before pushing your work to the
# remote git server.
$ yarn run lint
```
