({
    testTransactionChainingInCallback : {
        test: [
            function(cmp) {
                var tid1, tid2, tid3;
                var hlp = cmp.getDef().getHelper();

                tid1 = $A.getCurrentTransactionId();
                hlp.sendAction(cmp, true, undefined, function(a) {
                        $A.test.assertEquals("SUCCESS", a.getState());
                        tid2 = $A.getCurrentTransactionId();
                        $A.test.assertEquals(tid1, tid2);
                        hlp.sendAction(cmp, true, undefined, function (b) {
                                $A.test.assertEquals("SUCCESS", b.getState());
                                tid3 = $A.getCurrentTransactionId();
                                $A.test.assertEquals(tid1, tid3);
                            });
                    });
                $A.test.addWaitFor(true, function() { return tid3 !== undefined; });
            }
        ]
    },
    testTransactionSavedByGetCallback: {
        test: [
            function(cmp) {
                var tid = $A.getCurrentTransactionId();
                var hlp = cmp.getDef().getHelper();
                cmp._savedCb = $A.getCallback(function() { $A.test.assertEquals(tid, $A.getCurrentTransactionId()); });
                cmp._saved = function() { $A.test.assertFalse(tid === $A.getCurrentTransactionId()); };
                cmp._done = false;
                hlp.sendAction(cmp, true, undefined, function (b) {
                    cmp._done = true;
                });
                $A.test.addWaitFor(true, function() { return cmp._done; });
            },
            function(cmp) {
                cmp._savedCb();
                cmp._saved();
            }
        ]
    },
    testAbortOnOldTransaction : {
        test: [
            function fireFirstAction(cmp) {
                var hlp = cmp.getDef().getHelper();
                cmp.set("v.transactionId", "");
                hlp.sendAction(cmp, true, undefined,
                    function(a) {
                        $A.test.assertEquals("SUCCESS", a.getState());
                        cmp.set("v.transactionId", $A.getCurrentTransactionId());
                    });
                $A.test.addWaitFor(true, function() { return cmp.get("v.transactionId") !== ""; });
            },
            function fireSecondAbortableGroup(cmp) {
                var hlp = cmp.getDef().getHelper();
                var tid;
                hlp.sendAction(cmp, true, undefined, function(a) {
                        $A.test.assertEquals("SUCCESS", a.getState());
                        tid = $A.getCurrentTransactionId();
                    });
                $A.test.addWaitFor(true, function() { return tid !== undefined; },
                    function () {
                        $A.test.assertFalse(tid == cmp.get("v.transactionId"));
                    });
            },
            function fireActionInFirstAbortableGroupWhichAborts(cmp) {
                var hlp = cmp.getDef().getHelper();
                hlp.sendAction(cmp, true, cmp.get("v.transactionId"),
                    function(a) {
                        $A.test.assertEquals("ABORTED", a.getState());
                        $A.test.assertEquals(cmp.get("v.transactionId"), $A.getCurrentTransactionId());
                    });
                $A.test.addWaitFor(true, function() { return cmp.get("v.transactionId") !== ""; });
            }
        ]
    },
    testNoAbortWithInterveningNonAbortable : {
        test: [
            function firstAbortableGroup(cmp) {
                var hlp = cmp.getDef().getHelper();
                cmp.set("v.transactionId", "");
                hlp.sendAction(cmp, true, undefined,
                    function(a) {
                        $A.test.assertEquals("SUCCESS", a.getState());
                        cmp.set("v.transactionId", $A.getCurrentTransactionId());
                    });
                $A.test.addWaitFor(true, function() { return cmp.get("v.transactionId") !== ""; });
            },
            function fireSecondActionNonAbortable(cmp) {
                var hlp = cmp.getDef().getHelper();
                var tid;
                hlp.sendAction(cmp, false, undefined, function(a) {
                        $A.test.assertEquals("SUCCESS", a.getState());
                        tid = $A.getCurrentTransactionId();
                    });
                $A.test.addWaitFor(true, function() { return tid !== undefined; },
                    function () {
                        $A.test.assertEquals(tid, cmp.get("v.transactionId"));
                    });
            },
            function fireAbortableActionInFirstGroupWhichSucceeds(cmp) {
                var hlp = cmp.getDef().getHelper();
                hlp.sendAction(cmp, true, cmp.get("v.transactionId"),
                    function(a) {
                        $A.test.assertEquals("SUCCESS", a.getState());
                        $A.test.assertEquals(cmp.get("v.transactionId"), $A.getCurrentTransactionId());
                    });
                $A.test.addWaitFor(true, function() { return cmp.get("v.transactionId") !== ""; });
            }
        ]
    }
})
