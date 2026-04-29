<!--
 * @Author: huangyixin
 * @Date: 2021-12-07 11:42:48
 * @LastEditors: huangyixin
 * @LastEditTime: 2021-12-07 11:43:20
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/components/common/SvgIcon.vue
-->
<template>
	<svg :class="svgClass" aria-hidden="true" v-on="$listeners">
		<use :xlink:href="iconName" />
	</svg>
</template>

<script>
export default {
	name: "SvgIcon",
	props: {
		iconClass: {
			type: String,
			required: true,
		},
		className: {
			type: [String, Array],
			default: "",
		},
	},
	computed: {
		iconName() {
			return `#icon-${this.iconClass}`;
		},
		svgClass() {
			if (this.className) {
				if (this.className instanceof Array) {
					let classStr = this.className.join(" ");
					return "svg-icon " + classStr;
				} else {
					return "svg-icon " + this.className;
				}
			} else {
				return "svg-icon";
			}
		},
		styleExternalIcon() {
			return {
				mask: `url(${this.iconClass}) no-repeat 50% 50%`,
				"-webkit-mask": `url(${this.iconClass}) no-repeat 50% 50%`,
			};
		},
	},
};
</script>

<style scoped>
.svg-icon {
	/* fill: currentColor; */
	overflow: hidden;
}

.svg-external-icon {
	background-color: currentColor;
	mask-size: cover !important;
	display: inline-block;
}
</style>
