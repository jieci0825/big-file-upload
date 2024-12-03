# server
> 大文件上传的服务端，你如果想进行运行的话，请注意创建数据库

## 使用
1. 创建对应的数据库，本 demo 数据库版本需要 mysql8 以上，数据库名称是 `big_file_demo`，你可以换成你自己的，如果换成自己的需要修改 [配置文件](./src/config/global.config.js) 中的 `dbName` 字段

2. 修改 [配置文件](./src/config/global.config.js) 中的 `password` 字段，密码换成你自己的。

3. 安装依赖

   ```bash
   npm install
   ```

4. 启动项目

   ```bash
   npm run start
   ```

   