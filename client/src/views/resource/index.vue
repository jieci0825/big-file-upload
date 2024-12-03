<script setup>
import Header from './components/header.vue'
import Content from './components/content.vue'
import Footer from './components/footer.vue'
import { useSearch } from './hooks/useSearch'

const { handleSearch } = useSearch()
handleSearch()
</script>

<template>
	<div class="resource-container">
		<Header></Header>
		<Content></Content>
		<Footer></Footer>
	</div>
</template>

<style scoped lang="less">
.resource-container {
	margin: 0 auto;
	height: 100%;
	max-width: var(--center-width);
	padding: 20px;
	display: flex;
	flex-direction: column;
}
</style>
