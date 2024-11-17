const ssi = require("ssi");
const buildhtml = async () => {
  let includes = new ssi('./', './dist/', './*.html')
  includes.compile()
}

buildhtml()
