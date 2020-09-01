// The object 'Contracts' will be injected here, which contains all data for all contracts, keyed on contract name:
var Contracts = {};
Contracts['CryptoPizza'] = {
    abi: contract_abi,
    address: "0x8b0d9204db0adf41aa49e3fe43e20447555c28a3",
    endpoint: "http://mainnet-jsonrpc.conflux-chain.org:12537"
};

function logErr(err) {
    console.log(err);
}

function Pizza(Contract) {
    this.web3 = null;
    this.instance = null;
    this.Contract = Contract;
}

// Initializes the `Pizza` object and creates an instance of the web3.js library,
Pizza.prototype.init = function() {
    this.web3 = new window.Conflux.Conflux({
        url: this.Contract.endpoint,
        logger: console,
    });

    if (conflux.isConnected()) {
        this.web3.provider = conflux;  // set provider
    }
    
    this.instance = this.web3.Contract({
        abi: this.Contract.abi,
        address: this.Contract.address,
    });

    if (this.hasContractDeployed()) {
        this.updateDisplayContent();
    }
};

// Generates random DNA from string
Pizza.prototype.getRandomDna = function(name, address, cb) {
    this.instance.generateRandomDna(name, address).then(function(result) {
        console.log("getRandomDna", result);
        cb(null, result[0]);  // why return a array?
    }, cb);
};

// Returns all pizzas owned by specific address
Pizza.prototype.getPizzasByOwner = function(address, cb) {
    this.instance.getPizzasByOwner(address).then(function(result) {
        cb(null, result);
    }, cb);
};

// Waits for receipt from transaction
Pizza.prototype.waitForReceipt = function(hash, cb) {
    var that = this;
    this.web3.getTransactionReceipt(hash).then(function(receipt) {
        if (receipt !== null) {
            // Transaction went through
            if (cb) {
                cb(receipt);
            }
        } else {
            // Try again in 2 seconds
            window.setTimeout(function() {
                that.waitForReceipt(hash, cb);
            }, 2000);
        }
    }, cb);
};

// Creates random Pizza from string (name)
Pizza.prototype.createRandomPizza = function() {
    var that = this;

    // Gets input values
    var name = $("#create-name").val();

    // Validates name < 20 chars
    if (name.length > 20) {
        showStatus("Please name your Pizza with less than 32 characters");
        return;
    }

    // Validates name > 0 chars
    if (!name) {
        showStatus("Please enter valid name");
        return;
    }

    $("#button-create").attr("disabled", true);

    // Calls the public `createRandomPizza` function from the smart contract
    this.instance
        .createRandomPizza(name)
        .sendTransaction({
            from: conflux.selectedAddress
        }).then(
            function(txHash) {
                // If success, wait for confirmation of transaction,
                // then clear form values
                showStatus("Creating pizza");
                that.waitForReceipt(txHash, function(receipt) {
                    console.log('receipt status: ', receipt.status);
                    if (receipt.outcomeStatus == 0) {
                        showStatus("Creation successful");
                        $("#create-name").val("");
                        $("#create-tab .pizza-container .ingredients").html("");
                        $("#button-create").attr("disabled", false);
                        that.loadInventory();
                    } else {
                        showStatus("Something went wrong, please try it again");
                        $("#button-create").attr("disabled", false);
                    }
                });
            },
            function(error) {
                console.log("create pizza error", error);
                $("#button-create").attr("disabled", false);
            }
        );
};

// Loads all Pizzas owned by user
Pizza.prototype.loadInventory = function() {
    if (!conflux.selectedAddress) return;
    var that = this;

    this.instance.getPizzasByOwner(conflux.selectedAddress).then(function(
        pizzaIds
    ) {
        
        $(".inventory-list").html("");

        if (pizzaIds.length > 0) {
            for (let i = 0; i < pizzaIds.length; i++) {
                that.instance.pizzas(pizzaIds[i]).then(function(
                    pizza
                ) {
                    var realIndex = pizzaIds[i];
                    var pizzaName = pizza[0];
                    var pizzaId = pizza[1];
                    var pizza = that.generatePizzaImage(pizza[1]);
                    var actionButtons =
                        '<div class="action-buttons">\
                        <button class="btn button-gift" id="' +
                        realIndex +
                        '">Gift</button>\
                        <button class="btn button-eat" id="' +
                        realIndex +
                        '">Eat</button>\
                        </div>';

                    $(".inventory-list").append(
                        '<div id="pizza-' +
                            realIndex +
                            '" class="col-lg-6">\
                        <div class="pizza-container">\
                        <p><span style="float: left;">' +
                            pizzaName +
                            '</span><span id="' +
                            pizzaId +
                            '" class="pizzaDna" style="float: right;">#' +
                            pizzaId +
                            '</span></p>\
                        <div class="pizza-inner-container">\
                        <img class="pizza-frame" src="https://studio.ethereum.org/static/img/cryptopizza/container.jpg"/>\
                        <img src="https://studio.ethereum.org/static/img/cryptopizza/corpus.png"/>\
                        <div class="ingredients">\
                        ' +
                            pizza +
                            "\
                        </div></div>" +
                            actionButtons +
                            "</div></div>"
                    );

                    $(".inventory-list").append("</div>");
                    $(".inventory-list").append("</div>");
                    realIndex++;
                });
            }
        } else {
            $(".inventory-list").append(
                '<p style="text-align: center; width: 100%">It seems you don\'t have any CryptoPizza yet</p>'
            );
        }
    }, logErr);
};

// Updates container of Create new Pizza
Pizza.prototype.updateCreateContainer = function() {
    var pizzaName = $("#create-name").val();
    var that = this;

    // Disallow negative numbers
    if (pizzaName.length > 0) {
        this.getRandomDna(pizzaName, conflux.selectedAddress, function(error, pizzaDna) {
            if (error) {
                console.log(error);
            } else {
                if (pizzaDna == 5142446803) {
                    var a = new Audio(
                        "https://studio.ethereum.org/static/img/cryptopizza/1.mp3"
                    );
                    a.play();
                }
                var pizzaImage = that.generatePizzaImage(pizzaDna);
                $("#pizza-create-container .ingredients").html(pizzaImage);
            }
        });
    } else {
        $("#pizza-create-container .ingredients").html("");
    }
};

// Generates images from DNA - returns all of them in HTML
Pizza.prototype.generatePizzaImage = function(dna) {
    var url = "https://studio.ethereum.org/static/img/cryptopizza/";
    dna = dna.toString();
    var basis = (dna.substring(0, 2) % 2) + 1;
    var cheese = (dna.substring(2, 4) % 10) + 1;
    var meat = (dna.substring(4, 6) % 18) + 1;
    var spice = (dna.substring(6, 8) % 7) + 1;
    var veggie = (dna.substring(8, 10) % 22) + 1;

    var image = "";
    image += '<img src="' + url + "basis/basis-" + basis + '.png"/>';
    image += '<img src="' + url + "cheeses/cheese-" + cheese + '.png"/>';
    image += '<img src="' + url + "meats/meat-" + meat + '.png"/>';
    image += '<img src="' + url + "spices/spice-" + spice + '.png"/>';
    image += '<img src="' + url + "veggies/veg-" + veggie + '.png"/>';

    if (dna == 5142446803) {
        image =
            '<img src="https://studio.ethereum.org/static/img/cryptopizza/basis/basis-2.png"/>\
                 <img src="https://studio.ethereum.org/static/img/cryptopizza/meats/meat-13.png"/>\
                 <img src="https://studio.ethereum.org/static/img/cryptopizza/8fe918632d847e8ea3ebffbd47bd8ca9.png"/>';
    }

    return image;
};

// Gifts Pizza
Pizza.prototype.giftPizza = function(pizzaId, cb) {
    var that = this;

    var sendTo = prompt("Enter address which should receive your Pizza");

    if (!isValidAddress(sendTo)) {
        showStatus("Please enter a valid address");
        return;
    }

    $(".button-gift, .button-eat").attr("disabled", true);
    $("#pizza-" + pizzaId).css("opacity", "0.7");

    var pizzaDna = $("#pizza-" + pizzaId + " .pizzaDna").attr("id");

    if (pizzaDna == 5142446803) {
        var a = new Audio(
            "https://studio.ethereum.org/static/img/cryptopizza/2.mp3"
        );
        a.play();
    }

    // Calls the public `transferFrom` function from the smart contract
    this.instance.transferFrom(
        address,
        sendTo,
        pizzaId).sendTransaction({from: conflux.selectedAddress}).then(
        function(txHash) {
            showStatus("Sending Pizza...");
            that.waitForReceipt(txHash, function(receipt) {
                if (receipt.outcomeStatus == 0) {
                    // If success, wait for confirmation of transaction,
                    // then clear form values
                    $(".inventory-list").html("");
                    $(".button-gift, .button-eat").attr("disabled", false);
                    showStatus("Pizza sent");
                    that.loadInventory();
                } else {
                    showStatus("Pizza was not sent. Please try it again.");
                    $(".button-gift, .button-eat").attr("disabled", false);
                    $("#pizza-" + pizzaId).css("opacity", "1");
                }
            });
        },
        function(error) {
            console.error(error);
            showStatus("Sending canceled.");
            $("#pizza-" + pizzaId).css("opacity", "1");
        }
    );
};

// Eats Pizza
Pizza.prototype.eatPizza = function(pizzaId, cb) {
    var that = this;

    var confirmation = confirm("Are you sure?");

    if (confirmation) {
        $(".button-gift, .button-eat").attr("disabled", true);
        $("#pizza-" + pizzaId).css("opacity", "0.7");

        var pizzaDna = $("#pizza-" + pizzaId + " .pizzaDna").attr("id");

        if (pizzaDna == 5142446803) {
            var a = new Audio(
                "https://studio.ethereum.org/static/img/cryptopizza/3.mp3"
            );
            a.play();
        }

        // Calls the public `burn` function from the smart contract
        this.instance.burn(
            pizzaId,
            ).sendTransaction({from: conflux.selectedAddress}).then(
            function(txHash) {
                showStatus("Eating Pizza...");
                that.waitForReceipt(txHash, function(receipt) {
                    if (receipt.outcomeStatus == 0) {
                        $(".inventory-list").html("");
                        $(".button-gift, .button-eat").attr(
                            "disabled",
                            false
                        );
                        showStatus("Pizza is gone");
                        that.loadInventory();
                    } else {
                        showStatus(
                            "Pizza was not eaten. Please try it again."
                        );
                        $(".button-gift, .button-eat").attr(
                            "disabled",
                            false
                        );
                        $("#pizza-" + pizzaId).css("opacity", "1");
                    }
                });
            }, function(error) {
                console.error(error);
                $(".button-gift, .button-eat").attr("disabled", false);
                $("#pizza-" + pizzaId).css("opacity", "1");
                showStatus("Eating canceled.");
            }
        );
    } else {
        showStatus("Canceled");
    }
};

// Binds all inputs and buttons to specific functions
Pizza.prototype.bindInputs = function() {
    var that = this;
    var timeout = null; // Set timeout to every input so it doesn't fire too often

    $(document).on("change textInput input", "#create-name", function() {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            that.updateCreateContainer();
        }, 250);
    });

    $(document).on("click", "#button-create", function() {
        that.createRandomPizza();
    });

    $(document).on("click", "button.button-gift", function() {
        var pizzaId = $(this).attr("id");
        that.giftPizza(pizzaId);
    });

    $(document).on("click", "button.button-eat", function() {
        var pizzaId = $(this).attr("id");
        that.eatPizza(pizzaId);
    });

    $(document).on('click', 'button.connect-portal', async function() {
        const accounts = await conflux.enable();
        console.log('connected to portal');
    });

    $('#load-inventory').click(function() {
        that.loadInventory();
    });
};

// Removes the welcome content, and displays the main content.
// Called once a contract has been deployed
Pizza.prototype.updateDisplayContent = function() {
    this.hideWelcomeContent();
    this.showMainContent();
};

Pizza.prototype.hideWelcomeContent = function() {
    $("#welcome-container").addClass("hidden");
};

Pizza.prototype.showMainContent = function() {
    $("#main-container").removeClass("hidden");
};

// A contract will not have its address set until it has been deployed
Pizza.prototype.hasContractDeployed = function() {
    return this.instance && this.instance.address;
};

// Shows status on bottom of the page when some action happens
function showStatus(text) {
    var status = document.getElementById("status");
    status.innerHTML = text;
    status.className = "show";
    setTimeout(function() {
        status.className = status.className.replace("show", "");
    }, 3000);
}

// Checks if provided address has the basic requirements of an address
function isValidAddress(address) {
    return /^(0x)?[0-9a-f]{40}$/i.test(address);
}

if (typeof Contracts === "undefined")
    var Contracts = { CryptoPizza: { abi: [] } };

var pizza = new Pizza(Contracts["CryptoPizza"]);

Pizza.prototype.onReady = function() {
    this.init();
    this.bindInputs();
    this.loadInventory();
    showStatus("DApp loaded successfully.");
};

$(document).ready(function() {
    pizza.onReady();
});
