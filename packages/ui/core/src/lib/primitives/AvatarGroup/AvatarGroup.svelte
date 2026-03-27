<svelte:options runes={true} />

<script lang="ts">
  type AvatarItem = {
    src?: string;
    initials: string;
    alt?: string;
  };

  let {
    avatars = [],
    max = 5,
    size = "md",
    overlap = 8,
  }: {
    avatars?: AvatarItem[];
    max?: number;
    size?: "sm" | "md" | "lg";
    overlap?: number;
  } = $props();

  let visibleAvatars = $derived(avatars.slice(0, max));
  let overflowCount = $derived(Math.max(0, avatars.length - max));

  let sizeMap = { sm: 28, md: 36, lg: 48 };
  let fontSizeMap = { sm: "0.625rem", md: "0.75rem", lg: "0.875rem" };
  let avatarSize = $derived(sizeMap[size]);
</script>

<div
  class="cy-avatar-group cy-avatar-group--{size}"
  role="group"
  aria-label="Avatar group"
>
  {#each visibleAvatars as avatar, i}
    <div
      class="cy-avatar-group__item"
      style:width="{avatarSize}px"
      style:height="{avatarSize}px"
      style:margin-left={i > 0 ? `-${overlap}px` : "0"}
      style:z-index={visibleAvatars.length - i}
      style:font-size={fontSizeMap[size]}
      title={avatar.alt || avatar.initials}
    >
      {#if avatar.src}
        <img
          class="cy-avatar-group__img"
          src={avatar.src}
          alt={avatar.alt || avatar.initials}
        />
      {:else}
        <span class="cy-avatar-group__initials">{avatar.initials}</span>
      {/if}
    </div>
  {/each}

  {#if overflowCount > 0}
    <div
      class="cy-avatar-group__item cy-avatar-group__overflow"
      style:width="{avatarSize}px"
      style:height="{avatarSize}px"
      style:margin-left="-{overlap}px"
      style:z-index={0}
      style:font-size={fontSizeMap[size]}
      title="{overflowCount} more"
    >
      <span class="cy-avatar-group__initials">+{overflowCount}</span>
    </div>
  {/if}
</div>

<style>
  .cy-avatar-group {
    display: inline-flex;
    align-items: center;
  }

  .cy-avatar-group__item {
    position: relative;
    border-radius: 50%;
    background: var(--color-surface-raised, #12121a);
    border: 2px solid var(--color-surface-base, #0a0a0f);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    transition: transform 0.2s ease;
    cursor: default;
  }

  .cy-avatar-group__item:hover {
    transform: translateY(-2px);
    z-index: 100 !important;
  }

  .cy-avatar-group__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .cy-avatar-group__initials {
    color: var(--color-text-primary, rgba(255, 255, 255, 0.85));
    font-family: var(--font-body, system-ui, sans-serif);
    font-weight: var(--font-weight-medium, 500);
    line-height: 1;
    user-select: none;
  }

  .cy-avatar-group__overflow {
    background: var(--color-surface-active, rgba(0, 255, 65, 0.1));
  }

  .cy-avatar-group__overflow .cy-avatar-group__initials {
    color: var(--color-action-brand-default, #00ff41);
    font-size: 0.75em;
  }
</style>
