/**
 * Created by pascalbrewing on 08/10/14.
 */
"use strict";
var inquirer = require('inquirer');
var serverconfig = require('mcaprc');
var chalk = require('chalk');
var _ = require('lodash');
var Table = require('cli-table');
var displayTable = require('./behavior')

var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
var stringPattern = /^[a-zA-Z\s]+$/;

/**
 * config for Addding
 * @type {*[]}
 */
var configAdd = [
    {
        type    : "input",
        name    : "name",
        message : "Application Name",
        validate: function (value) {
            var pass = value.match(stringPattern);
            if ( pass ) {
                return true;
            } else {
                return "Please enter a valid Application name";
            }
        }
    },
    {
        type    : "input",
        name    : "baseUrl",
        message : "Enter the project url (http://....)",
        validate: function (value) {
            var pass = value.match(urlPattern);

            if ( pass ) {
                return true;
            } else {
                return "Please enter a valid url";
            }
        }
    },
    {
        type   : "input",
        name   : "userName",
        message: "Enter your username"
    },
    {
        type   : "password",
        name   : "password",
        message: "Enter your Password"
    }

];

/**
 * the confirm if you wanna add Y/N
 * @type {{type: string, name: string, message: string, default: boolean}[]}
 */
var configAddConfirm = [
    {
        type   : "confirm",
        name   : "addapp",
        message: "Wanna add the app with the following configuration ? ",
        default: true
    }
];


/**
 * add a new JSON Object to .mcaprc
 * @param program
 */
function addServer(program) {
    inquirer.prompt(
        configAdd,
        function (answers) {
            if ( answers ) {
                var conf = serverconfig.list();
                var rawAnswer = answers;
                var exist = conf[ 'server' ][ rawAnswer.name ] ? true : false;
                var newServerConfigTable = new Table({ head: [ 'Name', 'Base Url', 'User Name', 'Password' ] });
                newServerConfigTable.push(
                    [
                        rawAnswer.name,
                        rawAnswer.baseUrl,
                        rawAnswer.userName,
                        rawAnswer.password
                    ]
                );
                configAddConfirm[ 0 ].message += '\n' + newServerConfigTable + '\n';

                // Server allready exist
                if ( exist ) {
                    inquirer.prompt(
                        [
                            {
                                type   : "confirm",
                                name   : "overwriteapp",
                                message: chalk.red(rawAnswer.name) + " already exist , you want to override it? ",
                                default: true
                            }
                        ],
                        function (answers) {
                            if ( answers.overwriteapp ) {
                                serverconfig.parse(program.server, [ rawAnswer.name, rawAnswer.baseUrl, rawAnswer.userName, rawAnswer.password ]);
                                console.log(chalk.green('Server is added'));
                                return displayTable(serverconfig.list());
                            } else {
                                console.log(chalk.red('Abort'));
                            }
                        }
                    );
                } else {
                    //not exist wanna add ?
                    inquirer.prompt(
                        configAddConfirm,
                        function (answers) {
                            if ( answers.addapp ) {

                                serverconfig.parse(program.server, [ rawAnswer.name, rawAnswer.baseUrl, rawAnswer.userName, rawAnswer.password ]);
                                console.log(chalk.green('Server is added'));
                                displayTable(serverconfig.list());
                            } else {
                                console.log(chalk.green('Abort'));
                            }
                        }
                    );
                }
            }
        }
    );
}

module.exports = addServer;