<template>
    <div class="typeaheadContainer">
        <label for="nodeAddress">Node Address:</label>
        <div ref="inputContainer" class="inputContainer">
            <input
                id="nodeAddress"
                type="text"
                autocomplete="off"
                :value="internalValue"
                @input="e => setValue(e.target.value)"
                @keydown="e => onKeyPressed(e)"
            />
            <ul ref="suggestionList" v-show="showSuggestions && suggestions.length !== 0">
                <li
                    v-for="(suggestion, index) of suggestions"
                    :key="suggestion"
                    class="suggestion"
                    :class="{ activeSuggestion: activeSelection === index }"
                    @click="applySuggestion(suggestion)"
                >
                    {{ suggestion }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class NodeOverview extends Vue {
    @Prop()
    addresses!: string[];
    @Prop()
    value!: string;

    showSuggestions = false;
    activeSelection = -1;

    clickOutsideListener = (event: any) => {
        if (event.target.closest('.typeaheadContainer')) return;
        this.hideSuggestions();
    };

    mounted() {
        document.body.addEventListener('click', this.clickOutsideListener);
    }

    beforeUnmount() {
        document.body.removeEventListener('click', this.clickOutsideListener);
    }

    get internalValue(): string {
        return this.value;
    }

    set internalValue(val: string) {
        this.$emit('input', val);
    }

    get suggestions(): string[] {
        const searchVal: string = this.internalValue.trim();
        const startVal: string = this.internalValue.startsWith('0x') ? this.internalValue : '0x' + this.internalValue;
        const addresses = this.addresses
            .filter((address: string) => {
                return address.includes(searchVal);
            })
            .sort((a: string, b: string) => {
                // Buckets are: 0 -- starts with, 1 -- ends with, 2 -- contains
                let aBucket = 2;
                let bBucket = 2;

                if (a.startsWith(startVal)) aBucket = 0;
                if (b.startsWith(startVal)) bBucket = 0;

                if (aBucket === 2 && bBucket === 2) {
                    // Neither start with it, so check if either end with it
                    if (a.endsWith(searchVal)) aBucket = 1;
                    if (b.endsWith(searchVal)) bBucket = 1;
                }

                return aBucket - bBucket;
            });
        return addresses.length > 10 ? [] : addresses;
    }

    setValue(val: string) {
        if (val === '' || val === '0' || val === '0x') {
            this.hideSuggestions();
        } else if (!this.showSuggestions) {
            this.showSuggestions = true;
            this.activeSelection = 0;
        }

        this.internalValue = val;
    }

    applySuggestion(address: string) {
        this.setValue(address);
        this.hideSuggestions();
    }

    onKeyPressed(e: any) {
        const key: string = e.key;

        if (!this.showSuggestions) {
            // If Enter is hit when the suggestion bar is closed, submit
            // the value
            if (key === 'Enter') this.$emit('submit');
            return;
        }

        if (key === 'ArrowUp') {
            e.preventDefault();
            if (this.activeSelection > this.suggestions.length - 1) this.activeSelection = 0;
            if (this.activeSelection !== 0) this.activeSelection--;
        } else if (key === 'ArrowDown') {
            e.preventDefault();
            if (this.activeSelection > this.suggestions.length - 1) {
                this.activeSelection = 0;
                return;
            }
            if (this.activeSelection !== this.suggestions.length - 1) this.activeSelection++;
        } else if (key === 'Enter') {
            e.preventDefault();
            if (this.activeSelection > this.suggestions.length - 1) {
                this.activeSelection = 0;
                return;
            }
            this.applySuggestion(this.suggestions[this.activeSelection]);
        } else if (key === 'Escape') {
            e.preventDefault();
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        this.showSuggestions = false;
        this.activeSelection = -1;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.typeaheadContainer {
    display: inline-block;
}
label {
    font-weight: bold;
    margin-right: 5px;
}
.inputContainer {
    display: inline-block;
    margin-right: 15px;
    width: 25em;
    position: relative;
}
.inputContainer input {
    width: 100%;
    padding: 3px;
    box-sizing: border-box;
}
.inputContainer ul {
    position: absolute;
    list-style-type: none;
    width: 100%;
    padding: 0px;
    margin: 0px;
    overflow-x: scroll;
    z-index: 1;
}
.inputContainer li {
    padding: 3px;
    border: 1px solid black;
    background-color: white;
    width: 100%;
    box-sizing: border-box;
}
.inputContainer li:hover {
    background-color: lightgray;
    cursor: pointer;
}
li.activeSuggestion,
li.activeSuggestion:hover {
    background-color: cornflowerblue;
}
</style>
