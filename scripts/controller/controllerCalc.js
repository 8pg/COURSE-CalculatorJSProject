class Calc {

    // constructor - contém todos os atributos com seus valores iniciados
    constructor() {
        this._op_system = navigator.platform // pega o sistema operacional sendo usado pelo usuário
        this._audioOnOff = true // inicia a calculadora com o som dos cliques
        this._audio = new Audio('audio/click.mp3') // instância o arquivo de audio dos cliques para o controller 
        this._lastOperator = '' // último operador usado em braco
        this._lastNumber = '' // último número usado em branco
        this._operation = [0] // array das operações inicializado com o 0
        this._locale = "pt-br" // locale usado para a data e hora no formato brasileiro
        this._displayCalcEl = document.querySelector("#display") // pega a área do display usada no html
        this._dateEl = document.querySelector("#data") // pega a área da data usada no html
        this._timeEl = document.querySelector("#hora") // pega a área da hora usada no html
        this._currDate // data e hora atualizadas
        this.initialize()
        this.initButtonsEvents()
        this.initKeyboard()
    }

    // initialize - Inicializa funções do sistema
    initialize() {
        this.setDisplayDateTime()
        // setInterval - Função executada em um intervalo de tempo em milessegundos
        setInterval(() => {
            this.setDisplayDateTime()
        }, 1000)

        this.setLastNumberToDisplay()
        this.pasteFromClipboard()

        // define a regra de ativar/desativar o áudio dos cliques clicando duas vezes no botão AC
        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e => {
                this.toogleAudio()
            })
        })

        // define a regra de ativar/desativar o áudio dos cliques apertando duas vezes no botão esc
        let lastKeyPressTime = 0;
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                const timeSinceLastKeyPress = this.currDate - lastKeyPressTime

                // 500 milissegundos (meio segundo) de tempo máximo para o usuário pressionar a tecla duas vezes seguidas
                if (e.key === 'Escape' && timeSinceLastKeyPress < 500) {
                    this.toogleAudio()
                }

                lastKeyPressTime = this.currDate
            }
        });
    }

    // initButtonsEvents - Incia os eventos dos botões do SVG do html da cálculadora 
    initButtonsEvents() {
        // pega todos os id's de buttons e parts incluindo seus filhos (porque assim estão distribuidos pelo SVG)
        let buttons = document.querySelectorAll("#buttons > g, #parts > g")

        // para cada clique de botões
        buttons.forEach(btn => {
            this.addEventListenerAll(btn, 'click', e => {
                this.execBtn(btn.className.baseVal.replace('btn-', '')) // retira o btn dos nomes das classes e chama a função de executar botões de cliques
            })

            // muda o style do mouse para pointer ao passar pelos botões da cálculadora
            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {
                btn.style.cursor = 'pointer'
            })
        })
    }

    // addEventListenerAll - cria uma função para escutar múltiplos eventos de uma vez
    addEventListenerAll(element, events, fn) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false)
        })
    }

    // copyToClipboard - copia os dados do display para a área de transferência
    copyToClipboard() {
        // cria um elemento dinânico na tela
        let input = document.createElement('input')

        input.value = this.displayCalc

        // adiciona o input na tela
        document.body.appendChild(input)

        // seleciona o input
        input.select()

        document.execCommand('copy')

        // remove input da tela
        input.remove()
    }

    // pasteFromClipboard - cola o valor da área de transferência para o display da calculadora
    pasteFromClipboard() {
        document.addEventListener('paste', e => {
            if (!isNaN(`parseFloat`(e.clipboardData.getData('Text')))) this.displayCalc = e.clipboardData.getData('Text') // só cola se for um valor númerico
        })
    }

    // toogleAudio - ativa/desativa áudio
    toogleAudio() {
        this._audioOnOff = !this._audioOnOff
    }

    // playAudio - toca o áudio
    playAudio() {
        if (this._audioOnOff) {
            this._audio.currentTime = 0 // reseta o áudio para exucatar mesmo tendo um já em execução
            this._audio.play()
        }
    }

    // setDisplayDateTime - Configura os valores de data e hora com base nos valores atuais do sistema
    setDisplayDateTime() {
        this.displayDate = this.currDate.toLocaleDateString(this._locale, {
            "day": "2-digit",
            "month": "2-digit",
            "year": "2-digit"
        })
        this.displayTime = this.currDate.toLocaleTimeString(this._locale)
    }

    // execBtn - gerencia as chamadas de funções de acordo com os botões clicados
    execBtn(value) {
        this.playAudio()

        switch (value) {
            case 'ac':
                this.clearAll()
                break
            case 'ce':
                this.clearEntry()
                break
            case 'soma':
                this.addOperation("+")
                break
            case 'subtracao':
                this.addOperation("-")
                break
            case 'divisao':
                this.addOperation("/")
                break
            case 'multiplicacao':
                this.addOperation("*")
                break
            case 'porcento':
                this.addPercent()
                break
            case 'igual':
                this.calc()
                break
            case 'ponto':
                this.addDot(".")
                break
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(value)
                break
            default:
                this.setError()
                break
        }
    }

    // initKeyboard - gerencia as chamadas de funções de acordo com os botões do teclado pressionados
    initKeyboard() {
        document.addEventListener('keydown', e => {
            this.playAudio()
            switch (e.key) {
                case 'Escape':
                    this.clearAll()
                    break
                case 'Backspace':
                    this.clearEntry()
                    break
                case '+':
                case '-':
                case '/':
                case '*':
                    this.addOperation(e.key)
                    break
                case '%':
                    this.addPercent()
                    break
                case 'Enter':
                case '=':
                    this.calc()
                    break
                case '.':
                case ',':
                    this.addDot(".")
                    break
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(e.key)
                    break
                case 'c':
                    if (e.ctrlKey || (this._op_system == 'MacIntel' && e.metaKey)) this.copyToClipboard()
                    break
            }
        })
    }

    // clearAll - função responsável por resetar o array das operações
    clearAll() {
        this._operation = [0]
        this.setLastNumberToDisplay()
    }

    // clearEntry - limpa a última entrada
    clearEntry() {
        // se for limpar um campo de operador apaga o último operador salvo da memória
        if (this.isOperator(this.getLastOperation())) this._lastOperator = ''

        // Pop deleta o ultimo item do array
        this._operation.pop()

        this.setLastNumberToDisplay()

        // checa se a operação estiver vazia para setar o número no array de operações de acordo com o último existente ou 0 se não houver
        if (this._operation == '') (isNaN(this.getLastItem(false))) ? this._operation.push(0) : this._operation.push(this.getLastItem(false))
    }

    // addOperation - adiciona uma operação ao array, seja ela númerica, operatório ou resultante
    addOperation(value) {
        // se o último valor do array foi um número e o atual também é
        if (!isNaN(this.getLastOperation()) && !isNaN(value)) {
            // console.log("G+1")
            if (this.getLastOperation().toString() === "0") {
                this.setLastOperation('')
            }

            if (typeof this.getLastOperation() === 'string') {
                this.setLastOperation(this.getLastOperation().toString() + value.toString())
            } else {
                this.setLastOperation(value.toString())
            }
            this.setLastNumberToDisplay()
        } else {
            // se o novo valor for um operador
            if (this.isOperator(value)) {
                this._lastOperator = value

                // se o último foi um operador troca pelo novo
                if (isNaN(this.getLastOperation())) {
                    // console.log("G+2")
                    this.setLastOperation(value)

                    // se o último não foi um operador adicona o novo
                } else {
                    // console.log("G+3")
                    this._lastNumber = this.getLastItem(false)
                    this.pushOperation(value)
                }

                // se o novo valor for o ponto e o último valor for um número, adiciona o número ponto (Ex: "2.")
            } else if (isNaN(value) || !isNaN(this.getLastOperation())) {
                // console.log("G+4")
                this.setLastOperation(this.getLastOperation().toString() + value)
                this.setLastNumberToDisplay()

                // Se o novo valor for um número
            } else {
                // Push adiciona um item no array
                // console.log("G+5")
                this.pushOperation(value)
                this.setLastNumberToDisplay()
            }
        }
    }

    // addPercent - adicona o operador porcentagem (%)
    addPercent() {
        // excluí o operador se o último item do array for
        if (this.isOperator(this.getLastOperation())) {
            this._operation.pop()
        }

        // pré reliza a operação de porcentagem
        this.setLastOperation(this.getLastOperation() / 100)
        this.setLastNumberToDisplay()
    }

    // addDot - adiciona o ponto no valor númerico
    addDot(value) {
        // se for um operador o último valor do array adiciona 0 para realizar a operação
        if (this.isOperator(this.getLastOperation())) {
            this._operation.push(0)
        }

        // se houver mais de um ponto ignora a operação
        if (typeof this.getLastOperation() === 'string' && this.getLastOperation().split('').indexOf('.') > -1) return

        // adiciona o ponto
        this.addOperation(value)
    }

    // getLastOperation - pega o último valor do array
    getLastOperation() {
        return this._operation[this._operation.length - 1]
    }

    // setLastOperation - seta o valor passado na última posição do array existente
    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value
    }

    // isOperator - verifica se um dos valores considerados pela cálculadora é um operador
    isOperator(value) {
        return ["+", "-", "*", "/", "%"].indexOf(value) > -1
    }

    // pushOperation - adiciona um valor passado ao array de operação
    pushOperation(value) {
        // Push adiciona um item no array
        this._operation.push(value)

        // realiza as operações do array se o array possuir valores suficientes para tal
        if (this._operation.length > 3) {
            this.calc()
        }
    }

    // getResult - 
    getResult() {
        try {
            // mostra um log no console das operações geradas
            console.log(this._operation)

            // se o array não possuir um número no seu último indice, tenta pegar o último valor númerico para realizar a operação de cálculo
            if (isNaN(this.getLastOperation())) {
                this._operation.push(this.getLastItem(false))
            }

            // eval calcula a string gerada
            return eval(this._operation.join(""))
        } catch (e) {
            // setTimeout Executa uma ação após um determinado tempo e a executa uma única ve
            setTimeout(() => {
                this.setError()
            }, 1)
        }
    }

    // calc -  realiza a operação de cálculo dos valores do array de operações
    calc() {
        // se realiza o cálculo se existir um operador usado previamente
        if (this._lastOperator != '') {
            this._lastOperator = this.getLastItem()

            if (this._operation.length < 3) {
                if (this._lastNumber == '') this._lastNumber = this.getLastItem(false)
                // seta o array de operações com o único número informado usando para realizar a operação
                this._operation = [this._operation[0], this._lastOperator, this._lastNumber]
            }

            // se houver o número de valores suficientes seta o último numero com o resultad
            if (this._operation.length > 3) {
                this._lastNumber = this.getResult()

                // seta o último número com o último valor númerico do array antes de realizar a operação
            } else if (this._operation.length == 3) {
                this._lastNumber = this.getLastItem(false)
            }

            // seta o resultado no array de operações
            this._operation = [this.getResult()]
        } else {
            // quando houver só um valor no array retorna o valor númerico dele
            this._lastNumber = parseFloat(this.getLastItem(false))
            this._operation = [this._lastNumber]
        }

        this.setLastNumberToDisplay()
    }

    // getLastItem - retorna o último item operador ou número de acordo com o parâmetro (default é operador)
    getLastItem(isOperator = true) {
        for (let i = this._operation.length - 1; i >= 0; i--) {
            if (this.isOperator(this._operation[i]) == isOperator) {
                return this._operation[i]
            }
        }

        if (isOperator) return this._lastOperator
        return parseFloat(this._lastNumber)
    }

    // setLastNumberToDisplay - Configura os valores a serem exibidos no display
    setLastNumberToDisplay() {
        this.displayCalc = this.getLastItem(false) // pega o último valor númerico

        if (!this.getLastItem(false) || !this.getLastOperation()) this.displayCalc = 0 // se não hover valor númerico no array seta o valor para 0
    }

    // setError - seta o erro para ser exibido no display
    setError() {
        this.displayCalc = 'Error'
    }

    get displayCalc() {
        // innerHTML propriedade para manipular o DOM
        // pega o elemento para inserir uma info no formato HTML
        return this._displayCalcEl.innerHTML
    }

    set displayCalc(value) {
        this._displayCalcEl.innerHTML = value
    }

    get displayDate() {
        return this._dateEl.innerHTML
    }

    set displayDate(value) {
        return this._dateEl.innerHTML = value
    }

    get displayTime() {
        return this._timeEl.innerHTML
    }

    set displayTime(value) {
        return this._timeEl.innerHTML = value
    }

    get currDate() {
        return new Date()
    }

    set currDate(value) {
        this._currDate = value.toLocaleDateString()
    }

}