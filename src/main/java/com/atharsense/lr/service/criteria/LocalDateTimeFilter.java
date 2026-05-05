package com.atharsense.lr.service.criteria;

import java.time.LocalDateTime;
import tech.jhipster.service.filter.RangeFilter;

/**
 * Filter class for {@link LocalDateTime} attributes.
 */
public class LocalDateTimeFilter extends RangeFilter<LocalDateTime> {

    public LocalDateTimeFilter() {}

    public LocalDateTimeFilter(LocalDateTimeFilter filter) {
        super(filter);
    }

    @Override
    public LocalDateTimeFilter copy() {
        return new LocalDateTimeFilter(this);
    }
}

