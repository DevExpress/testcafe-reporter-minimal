var NEW_LINE = '\n ';

export default function () {
    return {
        noColors:           false,
        spaceLeft:          0,
        errDescriptors:     [],
        currentFixtureName: null,
        testCount:          0,
        skipped:            0,

        reportTaskStart (startTime, userAgents, testCount) {
            this.testCount = testCount;

            this.setIndent(1)
                .useWordWrap(true)
                .write(this.chalk.bold('Running tests in:'))
                .newline();

            userAgents.forEach(ua => {
                this.write(`- ${this.chalk.blue(ua)}`)
                    .newline();
            });
        },

        reportFixtureStart (name) {
            this.currentFixtureName = name;
        },

        reportTestDone (name, testRunInfo) {
            var hasErr = !!testRunInfo.errs.length;
            var symbol = null;

            if (testRunInfo.skipped) {
                this.skipped++;

                symbol = this.chalk.cyan('-');
            }
            else if (hasErr)
                symbol = this.chalk.red('!');
            else
                symbol = '.';

            if (this.spaceLeft - 1 < 0) {
                this.spaceLeft = this.viewportWidth - NEW_LINE.length - 1;
                this.write(NEW_LINE);
            }
            else
                this.spaceLeft--;

            this.write(symbol);

            if (hasErr) {
                this.errDescriptors = this.errDescriptors.concat(testRunInfo.errs.map(err => {
                    return {
                        err:         err,
                        testName:    name,
                        fixtureName: this.currentFixtureName
                    };
                }));
            }
        },

        _renderErrors () {
            this.newline();

            this.errDescriptors.forEach((errDescriptor) => {
                var title = `${this.chalk.bold.red(this.symbols.err)} ${errDescriptor.fixtureName} - ${errDescriptor.testName}`;

                this.setIndent(1)
                    .useWordWrap(true)
                    .newline()
                    .write(title)
                    .newline()
                    .newline()
                    .setIndent(3)
                    .write(this.formatError(errDescriptor.err))
                    .newline()
                    .newline();
            });
        },

        _renderWarnings (warnings) {
            this.newline()
                .setIndent(1)
                .write(this.chalk.bold.yellow(`Warnings (${warnings.length}):`))
                .newline();

            warnings.forEach(msg => {
                this.setIndent(1)
                    .write(this.chalk.bold.yellow(`--`))
                    .newline()
                    .setIndent(2)
                    .write(msg)
                    .newline();
            });
        },

        reportTaskDone (endTime, passed, warnings) {
            var allPassed = !this.errDescriptors.length;
            var footer    = allPassed ?
                            this.chalk.bold.green(`${this.testCount} passed`) :
                            this.chalk.bold.red(`${this.testCount - passed}/${this.testCount} failed`);

            if (!allPassed)
                this._renderErrors();
            else
                this.newline();

            this.setIndent(1)
                .newline()
                .write(footer)
                .newline();

            if (this.skipped > 0) {
                this.write(this.chalk.cyan(`${this.skipped} skipped`))
                    .newline();
            }

            if (warnings.length)
                this._renderWarnings(warnings);
        }
    };
}
