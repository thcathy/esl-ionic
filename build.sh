set -e

buildWebProd() {
  ionic cordova build browser --prod
}

buildios() {
 ionic cordova build ios --prod 
}

simios() {
 ionic cordova emulate ios -lc
}

deployWeb() {
  firebase deploy
}

buildWebAndDeploy() {
  buildiWebProd;
  deployWeb;
}

"$@"
