var NEW_LINE = '\n  ';

export default function () {
    return {
        noColors:           false,
        spaceLeft:          0,
        errDescriptors:     [],
        currentFixtureName: null,
        testCount:          0,

        reportTaskStart (startTime, userAgents, testCount) {
            this.testCount = testCount;
        },

        reportFixtureStart (name) {
            this.currentFixtureName = name;
        },

        reportTestDone (name, errs) {
            var hasErr = !!errs.length;
            var dot    = hasErr ? this.chalk.red('.') : '.';

            if (this.spaceLeft - 1 < 0) {
                this.spaceLeft = this.viewportWidth - NEW_LINE.length - 1;
                this.write(NEW_LINE);
            }
            else
                this.spaceLeft--;

            this.write(dot);

            if (hasErr) {
                this.errDescriptors = this.errDescriptors.concat(errs.map(err => {
                    return {
                        err:         err,
                        testName:    name,
                        fixtureName: this.currentFixtureName
                    };
                }));
            }
        },

        reportTaskDone (endTime, passed) {
            var allPassed = !this.errDescriptors.length;
            var footer    = allPassed ?
                            this.chalk.bold.green(`${this.testCount} passed`) :
                            this.chalk.bold.red(`${this.testCount - passed}/${this.testCount} failed`);

            this.setIndent(2)
                .newline()
                .newline()
                .write(footer)
                .newline();

            if (!allPassed) {
                this.errDescriptors.forEach((errDescriptor, idx) => {
                    var prefix = `${idx + 1}) `;
                    var title  = this.chalk.bold.red(`${prefix}${errDescriptor.fixtureName} - ${errDescriptor.testName}`);

                    this.setIndent(2)
                        .useWordWrap(true)
                        .newline()
                        .write(title)
                        .newline()
                        .setIndent(2 + prefix.length)
                        .write(this.formatError(errDescriptor.err))
                        .newline()
                        .newline();
                });
            }
        }
    };
}
