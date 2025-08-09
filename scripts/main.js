$(document).ready(function () {
  let deck = [];
  let playerHand = [];
  let dealerHand = [];
  let gameOver = false;

  function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];
    let newDeck = [];

    suits.forEach((suit) => {
      values.forEach((value) => {
        newDeck.push({ value, suit });
      });
    });

    return shuffle(newDeck);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function getSuitClass(card) {
    switch (card.suit) {
      case "♠":
        return "spades";
      case "♥":
        return "hearts";
      case "♦":
        return "diamonds";
      case "♣":
        return "clubs";
    }
  }

  function renderCard(card, hidden = false) {
    let suitClass = getSuitClass(card);

    if (hidden) {
      return `
        <div class="card back">
          <div class="card-inner">
            <div class="card-front"></div>
            <div class="card-back"><span></span><span></span></div>
          </div>
        </div>
      `;
    }

    return `
      <div class="card ${suitClass} flipped">
        <div class="card-inner">
          <div class="card-front"></div>
          <div class="card-back"><span>${card.value}</span><span>${card.suit}</span></div>
        </div>
      </div>
    `;
  }

  function renderHands(hideDealerCard) {
    $("#player-cards").empty();
    playerHand.forEach((card) => {
      $("#player-cards").append(renderCard(card));
    });

    $("#dealer-cards").empty();
    dealerHand.forEach((card, index) => {
      if (index === 1 && hideDealerCard) {
        $("#dealer-cards").append(renderCard(card, true));
      } else {
        $("#dealer-cards").append(renderCard(card));
      }
    });
  }

  function getHandValue(hand) {
    let value = 0;
    let aces = 0;

    hand.forEach((card) => {
      if (card.value === "A") {
        aces++;
        value += 11;
      } else if (["J", "Q", "K"].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    });

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  function updateScores(showDealer = false) {
    const playerScore = getHandValue(playerHand);
    $("#player-score").text(`Puntos: ${playerScore}`);

    if (showDealer) {
      const dealerScore = getHandValue(dealerHand);
      $("#dealer-score").text(`Puntos: ${dealerScore}`);
    } else {
      $("#dealer-score").text(`Puntos: ?`);
    }
  }

  function checkForBlackjack() {
    const playerScore = getHandValue(playerHand);
    const dealerScore = getHandValue(dealerHand);

    if (playerScore === 21 && dealerScore !== 21) {
      endGame("¡Blackjack!");
      return true;
    } else if (dealerScore === 21 && playerScore !== 21) {
      endGame("Blackjack del crupier");
      return true;
    } else if (playerScore === 21 && dealerScore === 21) {
      endGame("Empate con Blackjack, el crupier gana");
      return true;
    }
    return false;
  }

  function endGame(message) {
    gameOver = true;
    $("#result").text(message).fadeIn();
    $("#btn-hit, #btn-stand").prop("disabled", true);

    const $hiddenCard = $("#dealer-cards .card").eq(1);
    const hiddenCardData = dealerHand[1];
    if ($hiddenCard.hasClass("back")) {
      $hiddenCard
        .removeClass("back")
        .addClass(`${getSuitClass(hiddenCardData)} flipped`);
      $hiddenCard.find(".card-back span").eq(0).text(hiddenCardData.value);
      $hiddenCard.find(".card-back span").eq(1).text(hiddenCardData.suit);
    }

    updateScores(true);
  }

  function startGame() {
    deck = createDeck();
    playerHand = [];
    dealerHand = [];
    gameOver = false;
    // Ocultar el resultado al iniciar partida
    $("#result").hide().text("");
    $("#dealer-cards, #player-cards").empty();
    $("#btn-hit, #btn-stand").prop("disabled", false);

    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());
    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());

    renderHands(true);

    // Animar cartas iniciales (NO girar la segunda carta del dealer)
    $(".card").each(function (i) {
      const isDealerCard = $(this).closest("#dealer-cards").length > 0;
      const index = $(this).index();

      if (isDealerCard && index === 1) return; // Saltar segunda carta del dealer

      setTimeout(() => {
        $(this).removeClass("back").addClass("flipped");
        const cardData = isDealerCard ? dealerHand[index] : playerHand[index];
        $(this).removeClass("back").addClass(getSuitClass(cardData));
        $(this).find(".card-back span").eq(0).text(cardData.value);
        $(this).find(".card-back span").eq(1).text(cardData.suit);
      }, i * 300);
    });

    updateScores();
  }

  $("#btn-hit").on("click", function () {
    if (gameOver) return;

    const newCard = deck.pop();
    playerHand.push(newCard);
    $("#player-cards").append(renderCard(newCard, true));

    setTimeout(() => {
      const $lastCard = $("#player-cards .card").last();
      $lastCard
        .removeClass("back")
        .addClass(`${getSuitClass(newCard)} flipped`);
      $lastCard.find(".card-back span").eq(0).text(newCard.value);
      $lastCard.find(".card-back span").eq(1).text(newCard.suit);
      updateScores();
      if (getHandValue(playerHand) > 21) {
        endGame("Te pasaste");
      }
    }, 100);
  });

  $("#btn-stand").on("click", function () {
    if (gameOver) return;

    const $hiddenCard = $("#dealer-cards .card").eq(1);
    const hiddenCardData = dealerHand[1];

    // Mostrar carta oculta del dealer con animación
    $hiddenCard
      .removeClass("back")
      .addClass(`${getSuitClass(hiddenCardData)} flipped`);
    $hiddenCard.find(".card-back span").eq(0).text(hiddenCardData.value);
    $hiddenCard.find(".card-back span").eq(1).text(hiddenCardData.suit);
    updateScores(true);

    // Turno del crupier
    setTimeout(() => {
      function dealerDraw() {
        if (getHandValue(dealerHand) < 17) {
          const newCard = deck.pop();
          dealerHand.push(newCard);
          $("#dealer-cards").append(renderCard(newCard, true));

          const $lastCard = $("#dealer-cards .card").last();
          setTimeout(() => {
            $lastCard
              .removeClass("back")
              .addClass(`${getSuitClass(newCard)} flipped`);
            $lastCard.find(".card-back span").eq(0).text(newCard.value);
            $lastCard.find(".card-back span").eq(1).text(newCard.suit);
            updateScores(true);
            setTimeout(dealerDraw, 500); // sigue robando con retraso
          }, 300);
        } else {
          // Decide ganador sin renderizar todo de golpe
          const playerScore = getHandValue(playerHand);
          const dealerScore = getHandValue(dealerHand);

          if (dealerScore > 21) {
            endGame("El crupier se pasó");
          } else if (dealerScore > playerScore) {
            endGame("El crupier gana");
          } else if (dealerScore < playerScore) {
            endGame("¡Ganaste!");
          } else {
            endGame("Empate, el crupier gana");
          }
        }
      }
      dealerDraw();
    }, 600);
  });

  // Ocultar #result al hacer click en nueva partida y empezar nueva partida
  $("#btn-newgame").on("click", function () {
    $("#result").fadeOut(() => {
      startGame();
      if (!checkForBlackjack()) {
        updateScores();
      }
    });
  });

  // Evento para ocultar el mensaje si haces click fuera del <p id="result">
  $(document).on("click", function (e) {
    const $result = $("#result");
    if (
      $result.is(":visible") &&
      !$(e.target).is("#result") &&
      $result.has(e.target).length === 0
    ) {
      $result.fadeOut();
      startGame();
    }
  });

  // Iniciar automáticamente
  $("#result").hide();
  startGame();
  checkForBlackjack();
});
